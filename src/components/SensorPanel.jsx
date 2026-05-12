/**
 * SensorPanel — inline IoT sensor tracking panel for a borrowed item.
 *
 * Lender view (isLender=true):
 *   - Register a sensor device for the item
 *   - Link it to the active request
 *   - Simulate events for demo
 *   - See live event feed
 *
 * Borrower view (isLender=false):
 *   - See live condition of the item they borrowed
 *   - See event history
 */
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { getSocket } from '../utils/socket';

// ── Constants ─────────────────────────────────────────────────────────────────

const EVENT_META = {
    heartbeat:   { icon: '💚', label: 'Heartbeat',    bg: 'bg-success/10 border-success/20',  text: 'text-success'  },
    shock:       { icon: '⚡', label: 'Shock',         bg: 'bg-warning/10 border-warning/20',  text: 'text-warning'  },
    fall:        { icon: '💥', label: 'Fall / Impact', bg: 'bg-error/10   border-error/20',    text: 'text-error'    },
    tilt:        { icon: '↗️', label: 'Tilt',          bg: 'bg-warning/10 border-warning/20',  text: 'text-warning'  },
    overheat:    { icon: '🌡️', label: 'Overheat',      bg: 'bg-error/10   border-error/20',    text: 'text-error'    },
    low_battery: { icon: '🔋', label: 'Low Battery',   bg: 'bg-warning/10 border-warning/20',  text: 'text-warning'  },
};

const CONDITION_META = {
    good:     { icon: '✅', label: 'Good',     cls: 'text-success', badge: 'badge-success' },
    warning:  { icon: '⚠️', label: 'Warning',  cls: 'text-warning', badge: 'badge-warning' },
    critical: { icon: '🚨', label: 'Critical', cls: 'text-error',   badge: 'badge-error'   },
};

const SCENARIOS = [
    { value: 'heartbeat',   label: '💚 Heartbeat (normal)' },
    { value: 'shock',       label: '⚡ Shock' },
    { value: 'fall',        label: '💥 Fall / Impact' },
    { value: 'tilt',        label: '↗️ Tilt' },
    { value: 'overheat',    label: '🌡️ Overheat' },
    { value: 'low_battery', label: '🔋 Low Battery' },
];

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ReadingChip({ icon, label, value, unit }) {
    if (value === null || value === undefined) return null;
    return (
        <div className="flex flex-col items-center bg-base-200 rounded-xl px-3 py-2 min-w-[64px]">
            <span className="text-base">{icon}</span>
            <span className="font-bold text-sm font-mono">{typeof value === 'number' ? value.toFixed(1) : value}{unit}</span>
            <span className="text-xs text-base-content/40">{label}</span>
        </div>
    );
}

function EventRow({ ev }) {
    const meta = EVENT_META[ev.eventType] || EVENT_META.heartbeat;
    return (
        <div className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs ${meta.bg}`}>
            <span className="text-base flex-shrink-0">{meta.icon}</span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold ${meta.text}`}>{meta.label}</span>
                    <span className="text-base-content/40">{timeAgo(ev.createdAt)}</span>
                </div>
                {ev.note && <p className="text-base-content/60 mt-0.5">{ev.note}</p>}
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {ev.accelerationG !== null && <span className="font-mono bg-base-100 rounded px-1.5 py-0.5">{ev.accelerationG?.toFixed(1)}g</span>}
                    {ev.tiltDeg       !== null && <span className="font-mono bg-base-100 rounded px-1.5 py-0.5">{ev.tiltDeg?.toFixed(0)}°</span>}
                    {ev.temperatureC  !== null && <span className="font-mono bg-base-100 rounded px-1.5 py-0.5">{ev.temperatureC?.toFixed(1)}°C</span>}
                    {ev.batteryPct    !== null && <span className="font-mono bg-base-100 rounded px-1.5 py-0.5">{ev.batteryPct}%</span>}
                </div>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SensorPanel({ request, isLender }) {
    const requestId  = request._id;
    const itemId     = request.item?._id || request.item;
    const itemTitle  = request.item?.title || 'Item';

    const [open, setOpen]           = useState(false);
    const [sensorData, setSensorData] = useState(null);   // { device, events, hasDevice }
    const [loading, setLoading]     = useState(false);
    const [events, setEvents]       = useState([]);
    const [device, setDevice]       = useState(null);

    // Register form
    const [showRegister, setShowRegister] = useState(false);
    const [regForm, setRegForm]     = useState({ label: '', deviceId: '' });
    const [registering, setRegistering] = useState(false);
    const [newApiKey, setNewApiKey] = useState(null);

    // Simulate
    const [simScenario, setSimScenario] = useState('heartbeat');
    const [simulating, setSimulating]   = useState(false);

    // Live alert flash
    const [liveAlert, setLiveAlert] = useState(null);
    const alertTimer = useRef(null);

    // ── Load sensor data when panel opens ────────────────────────────────────
    useEffect(() => {
        if (!open) return;
        setLoading(true);
        api.get(`/sensors/request/${requestId}`)
            .then(res => {
                setSensorData(res.data);
                setDevice(res.data.device);
                setEvents(res.data.events || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open, requestId]);

    // ── Socket: live events for this request ─────────────────────────────────
    useEffect(() => {
        if (!open) return;
        const socket = getSocket();
        if (!socket) return;

        socket.emit('join_request', requestId);

        const handler = ({ event, condition }) => {
            // Update device condition
            setDevice(prev => prev ? { ...prev, condition } : prev);

            // Prepend event
            setEvents(prev => [event, ...prev.slice(0, 99)]);

            // Flash alert for non-heartbeat
            if (event.eventType !== 'heartbeat') {
                const meta = EVENT_META[event.eventType] || EVENT_META.heartbeat;
                setLiveAlert({ meta, event });
                clearTimeout(alertTimer.current);
                alertTimer.current = setTimeout(() => setLiveAlert(null), 6000);
            }
        };

        socket.on('sensor_event', handler);
        return () => {
            socket.off('sensor_event', handler);
            socket.emit('leave_request', requestId);
        };
    }, [open, requestId]);

    // ── Register device ───────────────────────────────────────────────────────
    const handleRegister = async (e) => {
        e.preventDefault();
        setRegistering(true);
        try {
            const res = await api.post('/sensors/devices', {
                label: regForm.label,
                deviceId: regForm.deviceId,
                itemId,
            });
            setNewApiKey(res.data.apiKey);
            // Auto-link to this request
            await api.post(`/sensors/devices/${res.data.deviceId}/link`, { requestId });
            const updated = await api.get(`/sensors/request/${requestId}`);
            setDevice(updated.data.device);
            setEvents(updated.data.events || []);
            setSensorData(updated.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed');
        } finally {
            setRegistering(false);
        }
    };

    // ── Link existing device ──────────────────────────────────────────────────
    const handleLink = async () => {
        if (!device) return;
        try {
            await api.post(`/sensors/devices/${device.deviceId}/link`, { requestId });
            const updated = await api.get(`/sensors/request/${requestId}`);
            setDevice(updated.data.device);
            setSensorData(updated.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Link failed');
        }
    };

    // ── Simulate ──────────────────────────────────────────────────────────────
    const handleSimulate = async () => {
        if (!device) return;
        setSimulating(true);
        try {
            await api.post('/sensors/simulate', { deviceId: device.deviceId, scenario: simScenario });
        } catch {
            // socket will deliver the event
        } finally {
            setSimulating(false);
        }
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const hasDevice   = sensorData?.hasDevice && device;
    const isLinked    = hasDevice && device.activeRequest;
    const cond        = CONDITION_META[device?.condition] || CONDITION_META.good;
    const latestEvent = events[0];

    // Only show for accepted requests
    if (request.status !== 'accepted') return null;

    return (
        <div className="mt-3 border-t border-base-300 pt-3">
            {/* Toggle button */}
            <button
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
                    device?.condition === 'critical' ? 'text-error' :
                    device?.condition === 'warning'  ? 'text-warning' :
                    'text-base-content/50 hover:text-primary'
                }`}
            >
                <span>📡</span>
                <span>
                    {hasDevice
                        ? `Sensor: ${cond.icon} ${cond.label}`
                        : isLender
                            ? 'Attach Sensor Tracker'
                            : 'Item Sensor'}
                </span>
                <span className="ml-auto">{open ? '▲' : '▼'}</span>
            </button>

            {/* Live alert banner */}
            {open && liveAlert && (
                <div className={`mt-2 flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border ${
                    liveAlert.event.severity === 'critical'
                        ? 'bg-error/10 border-error/30 text-error'
                        : 'bg-warning/10 border-warning/30 text-warning'
                }`}>
                    <span className="text-base animate-bounce">{liveAlert.meta.icon}</span>
                    <span>{liveAlert.meta.label} detected — {liveAlert.event.note}</span>
                    <button className="ml-auto opacity-60 hover:opacity-100" onClick={() => setLiveAlert(null)}>✕</button>
                </div>
            )}

            {open && (
                <div className="mt-3 space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <span className="loading loading-spinner loading-sm text-primary" />
                        </div>
                    ) : !hasDevice ? (
                        /* ── No device yet ── */
                        isLender ? (
                            !showRegister ? (
                                <div className="bg-base-200 rounded-2xl p-4 text-center space-y-2">
                                    <div className="text-3xl">📡</div>
                                    <p className="text-sm font-semibold">No sensor attached</p>
                                    <p className="text-xs text-base-content/50">
                                        Register an IoT sensor to track this item in real-time while it's borrowed.
                                    </p>
                                    <button
                                        onClick={() => setShowRegister(true)}
                                        className="btn btn-primary btn-sm rounded-full mt-1"
                                    >
                                        + Register Sensor
                                    </button>
                                </div>
                            ) : newApiKey ? (
                                /* API key reveal */
                                <div className="bg-base-200 rounded-2xl p-4 space-y-3">
                                    <p className="text-sm font-bold text-success">✅ Sensor registered & linked!</p>
                                    <p className="text-xs text-base-content/60">
                                        Flash this API key onto your device firmware. It won't be shown again.
                                    </p>
                                    <div className="bg-base-100 border border-base-300 rounded-xl p-3 font-mono text-xs break-all select-all">
                                        {newApiKey}
                                    </div>
                                    <p className="text-xs text-base-content/40">
                                        Device sends <code>POST /api/sensors/telemetry</code> with headers
                                        <code> X-Device-Id</code> and <code>X-Api-Key</code>.
                                    </p>
                                    <button
                                        className="btn btn-sm btn-outline rounded-full"
                                        onClick={() => { setShowRegister(false); setNewApiKey(null); }}
                                    >
                                        Done
                                    </button>
                                </div>
                            ) : (
                                /* Register form */
                                <form onSubmit={handleRegister} className="bg-base-200 rounded-2xl p-4 space-y-3">
                                    <p className="text-sm font-semibold">Register Sensor for "{itemTitle}"</p>
                                    <input
                                        type="text" required placeholder="Label (e.g. Sensor-001)"
                                        className="input input-bordered input-sm w-full"
                                        value={regForm.label}
                                        onChange={e => setRegForm(p => ({ ...p, label: e.target.value }))}
                                    />
                                    <input
                                        type="text" required placeholder="Device ID (MAC or custom)"
                                        className="input input-bordered input-sm w-full font-mono"
                                        value={regForm.deviceId}
                                        onChange={e => setRegForm(p => ({ ...p, deviceId: e.target.value }))}
                                    />
                                    <div className="flex gap-2">
                                        <button type="button" className="btn btn-ghost btn-sm flex-1" onClick={() => setShowRegister(false)}>Cancel</button>
                                        <button type="submit" disabled={registering} className="btn btn-primary btn-sm flex-1 rounded-full">
                                            {registering ? <span className="loading loading-spinner loading-xs" /> : 'Register & Link'}
                                        </button>
                                    </div>
                                </form>
                            )
                        ) : (
                            <div className="bg-base-200 rounded-2xl p-4 text-center">
                                <div className="text-2xl mb-1">📡</div>
                                <p className="text-xs text-base-content/50">No sensor attached to this item yet.</p>
                            </div>
                        )
                    ) : (
                        /* ── Device exists ── */
                        <>
                            {/* Status bar */}
                            <div className="flex items-center justify-between bg-base-200 rounded-2xl px-4 py-3">
                                <div>
                                    <p className="text-xs text-base-content/50 font-mono">{device.deviceId}</p>
                                    <p className="text-xs text-base-content/40">
                                        Last seen: {device.lastSeen ? timeAgo(device.lastSeen) : 'Never'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isLinked
                                        ? <span className="badge badge-success badge-xs">🔴 Live</span>
                                        : isLender && (
                                            <button onClick={handleLink} className="btn btn-xs btn-outline rounded-full">
                                                Link to Rental
                                            </button>
                                        )
                                    }
                                    <span className={`font-bold text-sm ${cond.cls}`}>{cond.icon} {cond.label}</span>
                                </div>
                            </div>

                            {/* Latest readings */}
                            {latestEvent && (
                                <div className="flex gap-2 flex-wrap">
                                    <ReadingChip icon="📳" label="Accel"  value={latestEvent.accelerationG} unit="g"   />
                                    <ReadingChip icon="↗️" label="Tilt"   value={latestEvent.tiltDeg}       unit="°"   />
                                    <ReadingChip icon="🌡️" label="Temp"   value={latestEvent.temperatureC}  unit="°C"  />
                                    <ReadingChip icon="🔋" label="Batt"   value={latestEvent.batteryPct}    unit="%"   />
                                </div>
                            )}

                            {/* Simulator (lender only) */}
                            {isLender && (
                                <div className="bg-base-200 rounded-xl p-3 border border-base-300">
                                    <p className="text-xs text-base-content/40 mb-2 font-semibold uppercase tracking-wider">
                                        🧪 Simulate (demo without hardware)
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        <select
                                            value={simScenario}
                                            onChange={e => setSimScenario(e.target.value)}
                                            className="select select-bordered select-xs rounded-full flex-1"
                                        >
                                            {SCENARIOS.map(s => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleSimulate}
                                            disabled={simulating}
                                            className="btn btn-xs btn-primary rounded-full"
                                        >
                                            {simulating ? <span className="loading loading-spinner loading-xs" /> : '▶ Fire'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Event feed */}
                            <div>
                                <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">
                                    Event History
                                </p>
                                {events.length === 0 ? (
                                    <p className="text-xs text-base-content/40 text-center py-3">
                                        Waiting for sensor data…
                                    </p>
                                ) : (
                                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                                        {events.map(ev => <EventRow key={ev._id} ev={ev} />)}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
