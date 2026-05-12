import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import api from '../utils/api';

// Fix Leaflet's broken default icon paths when bundled with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const categoryEmoji = {
  Tools: '🔧', Camping: '⛺', Party: '🎉',
  Kitchen: '🍳', Electronics: '📱', Sports: '⚽',
};

// Create a coloured div-icon per category
function makeIcon(category) {
  const emoji = categoryEmoji[category] || '📦';
  return L.divIcon({
    className: '',
    html: `<div style="
      background:white;
      border:2px solid #6366f1;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      width:36px;height:36px;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,.25);
    ">
      <span style="transform:rotate(45deg);font-size:16px;line-height:1">${emoji}</span>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });
}

// Geocode cache so we don't hit Nominatim twice for the same string
const geocodeCache = {};

async function geocode(locationStr) {
  const key = locationStr.trim().toLowerCase();
  if (geocodeCache[key]) return geocodeCache[key];

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationStr)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'ShareStuff-App/1.0' },
    });
    const data = await res.json();
    if (data?.[0]) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache[key] = coords;
      return coords;
    }
  } catch {
    // silently skip
  }
  return null;
}

// Small helper to re-fit bounds when markers change
function FitBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12, minZoom: 6 });
  }, [markers, map]);
  return null;
}

export default function ItemMap() {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true);

    api.get('/items')
      .then(async (res) => {
        const items = res.data || [];

        // Only items that have a location string
        const withLocation = items.filter((i) => i.location?.trim());

        setLoading(false);
        setGeocoding(true);

        const results = [];
        for (const item of withLocation) {
          if (abortRef.current) break;
          const coords = await geocode(item.location);
          if (coords) {
            results.push({ ...coords, item });
            // Update progressively so markers appear as they resolve
            setMarkers((prev) => [...prev, { ...coords, item }]);
          }
          // Nominatim rate limit: 1 req/sec
          await new Promise((r) => setTimeout(r, 1100));
        }

        setGeocoding(false);
      })
      .catch(() => setLoading(false));

    return () => { abortRef.current = true; };
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-base-300" style={{ height: 480 }}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-base-200/80 gap-3">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-sm text-base-content/60">Loading items…</p>
        </div>
      )}

      {/* Geocoding progress badge */}
      {geocoding && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] badge badge-primary gap-2 shadow-lg px-4 py-3">
          <span className="loading loading-spinner loading-xs"></span>
          Locating items on map…
        </div>
      )}

      <MapContainer
        center={[23.6850, 90.3563]} // Centre of Bangladesh
        zoom={7}
        minZoom={6}
        maxZoom={14}
        maxBounds={[[20.3, 87.9], [26.8, 93.0]]} // tight bbox around Bangladesh
        maxBoundsViscosity={1.0}               // hard-lock — can't pan outside
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds markers={markers} />

        {markers.map(({ lat, lng, item }) => (
          <Marker key={item._id} position={[lat, lng]} icon={makeIcon(item.category)}>
            <Popup minWidth={200}>
              <div className="text-sm">
                {item.images?.[0] && (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                )}
                <p className="font-bold text-base leading-tight mb-0.5">{item.title}</p>
                <p className="text-gray-500 text-xs mb-1">📍 {item.location}</p>
                <p className="text-indigo-600 font-semibold mb-2">৳{item.dailyFee}/day</p>
                <a
                  href={`/items/${item._id}`}
                  className="block text-center bg-indigo-600 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View Item →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      {markers.length > 0 && (
        <div className="absolute bottom-3 right-3 z-[1000] bg-base-100/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-base-300 text-xs space-y-1">
          <p className="font-semibold text-base-content/70 mb-1">Categories</p>
          {Object.entries(categoryEmoji).map(([cat, emoji]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <span>{emoji}</span>
              <span className="text-base-content/60">{cat}</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !geocoding && markers.length === 0 && (
        <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-base-100/90 rounded-2xl p-6 text-center shadow-lg">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="font-semibold">No located items yet</p>
            <p className="text-xs text-base-content/50 mt-1">Items need a location to appear on the map</p>
          </div>
        </div>
      )}
    </div>
  );
}
