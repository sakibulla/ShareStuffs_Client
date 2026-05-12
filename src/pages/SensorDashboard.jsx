import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import { connectSocket, getSocket } from '../utils/socket';

// ── Constants ─────────────────────────────────────────────────────────────────

const SCENARIOS = ['heartbeat', 'shock', 'fall', 'tilt', 'overheat', 'low_battery'];

const EVENT_META = {
    heartbeat:   { icon: '💚', label: 'Heartbeat',   color: 'badge-success' },
    shock:       { icon: '⚡', label: 'Shock',        color: 'badge-warning' },
    fall:        { icon: '💥', label: 'Fall / Impact',color: 'badge-error'   },
    tilt:        { icon: '↗️', label: 'Tilt',         color: 'badge-warning' },
    overheat:    { icon: '🌡️', label: 'Overheat',     color: 'badge-error'   },
    low_battery: { icon: '🔋', label: 'Low Battery',  color: 'badge-warning' },
};

const CONDITION_META = {
    good:     { icon: '✅', label: 'Good',     cls: 'text-success' },
    warning:  { icon: '⚠️', label: 'Warning',  cls: 'text-warning' },
    critical: { icon: '🚨', label: 'Critical', cls: 'text-error'   },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString();
}

function ReadingPill({ label, value, unit }) {
    if (value === null || value === undefined) return null;
    return (
        <span className="inline-flex items-center gap-1 bg-base-200 rounded-full px-3 py-1 text-xs font-mono">
            <span className="text-base-content/50">{label}</span>
            <span className="font-bold">{typeof value === 'number' ? value.toFixed(1) : value}{unit}</span>
        </span>
    );
}

// ── Register Device Modal ─────────────────────────────────────────────────────

function RegisterModal({ myItems, onClose, onRegistered }) {
    const { addToast } = useToast();
    const [form, setForm] = useState({ label: '', deviceId: '', itemId: '' });
    const [saving, setSaving] = useState(false);
    const [createdKey, setCreatedKey] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.post('/sensors/devices', form);
            setCreatedKey(res.data.apiKey);
            onRegistered(res.data);
            addToast('Device registered!', 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Registration failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-md">
                {createdKey ? (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-success">✅ Device Registered</h3>
                        <p className="text-sm text-base-content/70">
                            Flash this API key onto your sensor firmware. It will <strong>not</strong> be shown again.
                        </p>
                        <div className="bg-base-200 rounded-xl p-4 font-mono text-xs break-all select-all border border-base-300">
                            {createdKey}
                        </div>
                        <p className="text-xs text-base-content/50">
                            The device should send <code>X-Device-Id</code> and <code>X-Api-Key</code> headers with every telemetry POST to <code>/api/sensors/telemetry</code>.
                        </p>
                        <button className="btn btn-primary btn-block rounded-full" onClick={onClose}>Done</button>
                    </div>
                ) : (
                    <>
                        <h3 className="text-lg font-bold mb-4">Register Sensor Device</h3>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="form-control">
                                <label className="label py-1"><span className="label-text font-medium">Label</span></label>
                                <input
                                    type="text" required placeholder="e.g. Sensor-001"
                                    className="input input-bordered w-full"
                                    value={form.label}
                                    onChange={(e) => setForm(p => ({ ...p, label: e.target.value }))}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label py-1"><span className="label-text font-medium">Device ID</span></label>
                                <input
                                    type="text" required placeholder="MAC address or custom ID"
                                    className="input input-bordered w-full font-mono"
                                    value={form.deviceId}
                                    onChange={(e) => setForm(p => ({ ...p, deviceId: e.target.value }))}
                                />
                                <label className="label py-0.5"><span className="label-text-alt text-base-content/40">Unique identifier flashed onto the hardware</span></label>
                            </div>
                            <div className="form-control">
                                <label className="label py-1"><span className="label-text font-medium">Assign to Item</span></label>
                                <select
                                    required className="select select-bordered w-full"
                                    value={form.itemId}
                                    onChange={(e) => setForm(p => ({ ...p, itemId: e.target.value }))}
                                >
                                    <option value="" disabled>Select one of your items…</option>
                                    {myItems.map(item => (
                                        <option key={item._id} value={item._id}>{item.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>Cancel</button>
                                <button type="submit" disabled={saving} className="btn btn-primary flex-1 rounded-full">
                                    {saving ? <span className="loading loading-spinner loading-sm" /> : 'Register'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
            <div className="modal-backdrop" onClick={onClose} />
        </div>
    );
}

// ── Event Timeline ────────────────────────────────────────────────────────────

function EventTimeline({ events, loading }) {
    if (loading) return (
        <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-md text-primary" />
        </div>
    );
    if (!events.length) return (
        <div className="text-center py-10 text-base-content/40 text-sm">No events yet — waiting for sensor data…</div>
    );

    return (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {events.map((ev) => {
                const meta = EVENT_META[ev.eventType] || EVENT_META.heartbeat;
                return (
                    <div key={ev._id}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                            ev.severity === 'critical' ? 'bg-error/5 border-error/20' :
                            ev.severity === 'warning'  ? 'bg-warning/5 border-warning/20' :
                            'bg-base-200 border-base-300'
                        }`}
                    >
                        <span className="text-xl flex-shrink-0 mt-0.5">{meta.icon}</span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`badge badge-sm ${meta.color}`}>{meta.label}</span>
                                <span className="text-xs text-base-content/40">{timeAgo(ev.createdAt)}</span>
                            </div>
                            {ev.note && <p className="text-xs text-base-content/60 mt-1">{ev.note}</p>}
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                <ReadingPill label="accel" value={ev.accelerationG} unit="g" />
                                <ReadingPill label="tilt" value={ev.tiltDeg} unit="°" />
                                <ReadingPill label="temp" value={ev.temperatureC} unit="°C" />
                                <ReadingPill label="batt" value={ev.batteryPct} unit="%" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SensorDashboard() {
    const { user, token } = useAuth();
    const { addToast } = useToast();

    const [devices, setDevices] = useState([]);
    const [myItems, setMyItems] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [events, setEvents] = useState([]);
    const [loadingDevices, setLoadingDevices] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [simScenario, setSimScenario] = useState('heartbeat');
    const [liveAlerts, setLiveAlerts] = useState([]);
    const alertTimeoutRef = useRef({});

    // ── Socket: listen for live sensor events ─────────────────────────────────
    useEffect(() => {
        if (!token) return;
        const socket = connectSocket(token);

        const handleSensorEvent = ({ event, deviceId, condition }) => {
            // Flash a live alert
            const meta = EVENT_META[event.eventType] || EVENT_META.heartbeat;
            if (event.severity !== 'info') {
                const alertId = Date.now();
                setLiveAlerts(prev => [{ id: alertId, event, meta, condition }, ...prev.slice(0, 4)]);
                clearTimeout(alertTimeoutRef.current[alertId]);
                alertTimeoutRef.current[alertId] = setTimeout(() => {
                    setLiveAlerts(prev => prev.filter(a => a.id !== alertId));
                }, 8000);
            }

            // Update device condition in list
            setDevices(prev => prev.map(d =>
                d.deviceId === deviceId ? { ...d, condition, lastSeen: new Date().toISOString() } : d
            ));

            // Append to event list if this device is selected
            setSelectedDevice(sel => {
                if (sel?.deviceId === deviceId) {
                    setEvents(prev => [event, ...prev]);
                }
                return sel;
            });
        };

        socket.on('sensor_event', handleSensorEvent);
        return () => socket.off('sensor_event', handleSensorEvent);
    }, [token]);

    // ── Load devices + items ──────────────────────────────────────────────────
    const loadDevices = useCallback(async () => {
        setLoadingDevices(true);
        try {
            const [devRes, itemRes] = await Promise.all([
                api.get('/sensors/devices'),
                api.get('/items/my'),
            ]);
            setDevices(devRes.data);
            setMyItems(itemRes.data);
        } catch {
            addToast('Failed to load sensor devices', 'error');
        } finally {
            setLoadingDevices(false);
        }
    }, [addToast]);

    useEffect(() => { loadDevices(); }, [loadDevices]);

    // ── Load events for selected device ──────────────────────────────────────
    useEffect(() => {
        if (!selectedDevice) return;
        setLoadingEvents(true);
        api.get(`/sensors/devices/${selectedDevice.deviceId}/events`)
            .then(res => setEvents(res.data.events || []))
            .catch(() => addToast('Failed to load events', 'error'))
            .finally(() => setLoadingEvents(false));
    }, [selectedDevice, addToast]);

    // ── Simulate ──────────────────────────────────────────────────────────────
    const handleSimulate = async () => {
        if (!selectedDevice) return;
        setSimulating(true);
        try {
            await api.post('/sensors/simulate', {
                deviceId: selectedDevice.deviceId,
                scenario: simScenario,
            });
            addToast(`Simulated: ${simScenario}`, 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Simulation failed', 'error');
        } finally {
            setSimulating(false);
        }
    };

    // ── Stats ─────────────────────────────────────────────────────────────────
    const criticalCount = devices.filter(d => d.condition === 'critical').length;
    const warningCount  = devices.filter(d => d.condition === 'warning').length;
    const goodCount     = devices.filter(d => d.condition === 'good').length;

    return (
        <div className="min-h-screen bg-base-200 fade-in">
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            📡 Sensor Dashboard
                        </h1>
                        <p className="text-base-content/50 text-sm mt-1">
                            Real-time IoT tracking for your borrowed items
                        </p>
                    </div>
                    <button
                        onClick={() => setShowRegister(true)}
                        className="btn btn-primary rounded-full gap-2"
                    >
                        + Register Device
                    </button>
                </div>

                {/* Live alert toasts */}
                {liveAlerts.length > 0 && (
                    <div className="fixed top-20 right-4 z-50 space-y-2 w-80">
                        {liveAlerts.map(alert => (
                            <div key={alert.id}
                                className={`alert shadow-xl rounded-2xl border text-sm ${
                                    alert.event.severity === 'critical' ? 'alert-error' : 'alert-warning'
                                }`}
                            >
                                <span className="text-xl">{alert.meta.icon}</span>
                                <div>
                                    <p className="font-bold">{alert.meta.label} detected</p>
                                    <p className="text-xs opacity-80">{alert.event.note}</p>
                                </div>
                                <button
                                    className="btn btn-ghost btn-xs"
                                    onClick={() => setLiveAlerts(p => p.filter(a => a.id !== alert.id))}
                                >✕</button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Good', value: goodCount,     icon: '✅', cls: 'text-success', bg: 'bg-success/10 border-success/20' },
                        { label: 'Warning', value: warningCount, icon: '⚠️', cls: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
                        { label: 'Critical', value: criticalCount, icon: '🚨', cls: 'text-error',   bg: 'bg-error/10 border-error/20'   },
                    ].map(s => (
                        <div key={s.label} className={`card border ${s.bg} p-4 text-center`}>
                            <div className="text-2xl mb-1">{s.icon}</div>
                            <div className={`text-3xl font-extrabold ${s.cls}`}>{s.value}</div>
                            <div className="text-xs text-base-content/50 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Device list */}
                    <div className="lg:col-span-1">
                        <h2 className="text-lg font-bold mb-3">My Devices</h2>
                        {loadingDevices ? (
                            <div className="flex justify-center py-10">
                                <span className="loading loading-spinner loading-md text-primary" />
                            </div>
                        ) : devices.length === 0 ? (
                            <div className="card bg-base-100 border border-base-300 p-8 text-center">
                                <div className="text-4xl mb-3">📡</div>
                                <p className="font-semibold mb-1">No devices yet</p>
                                <p className="text-sm text-base-content/50 mb-4">
                                    Register your first IoT sensor to start tracking borrowed items.
                                </p>
                                <button onClick={() => setShowRegister(true)} className="btn btn-primary btn-sm rounded-full">
                                    Register Device
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {devices.map(device => {
                                    const cond = CONDITION_META[device.condition] || CONDITION_META.good;
                                    const isSelected = selectedDevice?.deviceId === device.deviceId;
                                    return (
                                        <button
                                            key={device._id}
                                            onClick={() => setSelectedDevice(device)}
                                            className={`w-full text-left card border p-4 transition-all duration-200 hover:shadow-md ${
                                                isSelected
                                                    ? 'bg-primary/10 border-primary'
                                                    : 'bg-base-100 border-base-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-sm truncate">{device.label}</span>
                                                <span className={`text-lg ${cond.cls}`}>{cond.icon}</span>
                                            </div>
                                            <p className="text-xs text-base-content/50 font-mono truncate">{device.deviceId}</p>
                                            <p className="text-xs text-base-content/50 mt-1 truncate">
                                                📦 {device.item?.title || 'Unknown item'}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className={`text-xs font-semibold ${cond.cls}`}>{cond.label}</span>
                                                <span className="text-xs text-base-content/40">
                                                    {device.lastSeen ? timeAgo(device.lastSeen) : 'Never seen'}
                                                </span>
                                            </div>
                                            {device.activeRequest && (
                                                <div className="badge badge-success badge-xs mt-2">🔴 Live tracking</div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Event panel */}
                    <div className="lg:col-span-2">
                        {!selectedDevice ? (
                            <div className="card bg-base-100 border border-base-300 h-full flex items-center justify-center p-12 text-center">
                                <div className="text-5xl mb-3">👈</div>
                                <p className="font-semibold">Select a device</p>
                                <p className="text-sm text-base-content/50 mt-1">Choose a sensor from the list to view its event history.</p>
                            </div>
                        ) : (
                            <div className="card bg-base-100 border border-base-300">
                                <div className="card-body p-5">
                                    {/* Device header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                        <div>
                                            <h2 className="text-xl font-bold">{selectedDevice.label}</h2>
                                            <p className="text-xs text-base-content/40 font-mono">{selectedDevice.deviceId}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const cond = CONDITION_META[selectedDevice.condition] || CONDITION_META.good;
                                                return (
                                                    <span className={`font-bold text-sm flex items-center gap-1 ${cond.cls}`}>
                                                        {cond.icon} {cond.label}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Readings summary */}
                                    {events.length > 0 && (() => {
                                        const latest = events[0];
                                        return (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                                                {[
                                                    { label: 'Acceleration', value: latest.accelerationG, unit: 'g', icon: '📳' },
                                                    { label: 'Tilt', value: latest.tiltDeg, unit: '°', icon: '↗️' },
                                                    { label: 'Temperature', value: latest.temperatureC, unit: '°C', icon: '🌡️' },
                                                    { label: 'Battery', value: latest.batteryPct, unit: '%', icon: '🔋' },
                                                ].map(r => r.value !== null && (
                                                    <div key={r.label} className="bg-base-200 rounded-xl p-3 text-center">
                                                        <div className="text-xl mb-1">{r.icon}</div>
                                                        <div className="text-lg font-bold font-mono">
                                                            {typeof r.value === 'number' ? r.value.toFixed(1) : r.value}{r.unit}
                                                        </div>
                                                        <div className="text-xs text-base-content/50">{r.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}

                                    {/* Simulator */}
                                    <div className="bg-base-200 rounded-2xl p-4 mb-5 border border-base-300">
                                        <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3">
                                            🧪 Demo Simulator — test without real hardware
                                        </p>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <select
                                                value={simScenario}
                                                onChange={e => setSimScenario(e.target.value)}
                                                className="select select-bordered select-sm rounded-full"
                                            >
                                                {SCENARIOS.map(s => (
                                                    <option key={s} value={s}>{EVENT_META[s]?.icon} {s}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={handleSimulate}
                                                disabled={simulating}
                                                className="btn btn-sm btn-primary rounded-full"
                                            >
                                                {simulating
                                                    ? <span className="loading loading-spinner loading-xs" />
                                                    : '▶ Simulate Event'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <h3 className="font-semibold mb-3 text-sm text-base-content/60 uppercase tracking-wider">
                                        Event History
                                    </h3>
                                    <EventTimeline events={events} loading={loadingEvents} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Register modal */}
            {showRegister && (
                <RegisterModal
                    myItems={myItems}
                    onClose={() => setShowRegister(false)}
                    onRegistered={(device) => {
                        setDevices(prev => [device, ...prev]);
                    }}
                />
            )}
        </div>
    );
}
