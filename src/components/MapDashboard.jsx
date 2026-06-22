import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Compass, AlertTriangle, ShieldCheck, Heart, MapPin, EyeOff } from 'lucide-react';

// Setup Map Center & Zoom (Mumbai BKC coordinates as default)
const MAP_CENTER = [19.0760, 72.8777];

// Danger Zones list (Coordinates and radius in meters)
const DANGER_ZONES = [
  { id: 'zone-1', center: [19.0720, 72.8810], radius: 250, label: "Mithi River Overflow (Kurla)" },
  { id: 'zone-2', center: [19.0400, 72.8600], radius: 180, label: "Live Powerlines Sparking (Sion)" }
];

// Helper to check distance between two coordinates in km (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; 
  return d;
}

// Custom DivIcons for styling without depending on external asset files
const createCustomIcon = (color, char) => L.divIcon({
  html: `<div style="
    background: ${color}; 
    width: 32px; 
    height: 32px; 
    border-radius: 50%; 
    border: 2px solid white; 
    box-shadow: 0 0 12px ${color}; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    color: white; 
    font-weight: bold; 
    font-size: 14px;">${char}</div>`,
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Map Controller to change view programmatically
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

export default function MapDashboard({ 
  shelters = [], 
  emergencies = [], 
  reports = [],
  sharedSupplies = [],
  userCoords = MAP_CENTER,
  selectedLocation = null 
}) {
  const [showShelters, setShowShelters] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showSharedSupplies, setShowSharedSupplies] = useState(true);
  
  const [routingTarget, setRoutingTarget] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Default hospitals coordinates around center
  const hospitals = [
    { id: 'hosp-1', name: 'KEM General Hospital', lat: 19.0028, lng: 72.8419, phone: '+91 22 2410 7000', status: 'Operational' },
    { id: 'hosp-2', name: 'Lilavati Medical Center', lat: 19.0514, lng: 72.8250, phone: '+91 22 2675 1000', status: 'Operational' },
    { id: 'hosp-3', name: 'Sion Memorial Hospital', lat: 19.0358, lng: 72.8600, phone: '+91 22 2407 6381', status: 'Critical Load' }
  ];

  // Route generation algorithm (Simulates finding safe detour path avoiding Danger Zones)
  const calculateSafeRoute = (target) => {
    setRoutingTarget(target);
    const start = userCoords || MAP_CENTER;
    const dest = [target.lat, target.lng];

    // Simple detour simulator: if direct path intersects with a danger zone, create intermediate detour point
    let route = [start];
    let routeDesc = "Safe route determined. Avoiding active flooding near Kurla Mithi River.";
    let risk = "Low Risk";
    let riskColor = "var(--success)";
    
    // Check if path passes near danger zone 1
    const dz1 = DANGER_ZONES[0].center;
    const distanceToDz1 = getDistance(start[0], start[1], dz1[0], dz1[1]);
    
    if (distanceToDz1 < 0.6) {
      // Direct path would go through danger, offset the route to bypass
      const detourPoint = [start[0] + 0.004, start[1] - 0.006];
      route.push(detourPoint);
      routeDesc = "Detour active: Path routed via Sion bypass to avoid flooded underpass.";
      risk = "Moderate Risk (Nearing flood borders)";
      riskColor = "var(--warning)";
    }
    
    route.push(dest);
    setRouteCoordinates(route);

    // Calculate details
    const totalDist = getDistance(start[0], start[1], target.lat, target.lng);
    const estTime = Math.round(totalDist * 12); // ~12 mins per km walking in emergency

    setRouteInfo({
      distance: `${totalDist.toFixed(1)} km`,
      time: `${estTime} mins`,
      risk,
      riskColor,
      description: routeDesc
    });
  };

  const clearRoute = () => {
    setRoutingTarget(null);
    setRouteInfo(null);
    setRouteCoordinates([]);
  };

  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', height: '100%' }}>
      {/* Map Control Toolbar */}
      <div className="glass-panel" style={{ padding: '12px 20px', marginBottom: '15px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Compass className="text-secondary" size={20} />
          <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Map Layers:</span>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input type="checkbox" checked={showShelters} onChange={() => setShowShelters(!showShelters)} />
            🏡 Shelters
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input type="checkbox" checked={showHospitals} onChange={() => setShowHospitals(!showHospitals)} />
            🏥 Hospitals
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input type="checkbox" checked={showReports} onChange={() => setShowReports(!showReports)} />
            ⚠️ Hazards
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input type="checkbox" checked={showSharedSupplies} onChange={() => setShowSharedSupplies(!showSharedSupplies)} />
            ⭐ Spare Supplies
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input type="checkbox" checked={showDangerZones} onChange={() => setShowDangerZones(!showDangerZones)} />
            🔴 Danger Zones
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: routingTarget ? '1fr 320px' : '1fr', gap: '15px', height: '100%' }}>
        {/* The Leaflet Map */}
        <div className="map-wrapper">
          <MapContainer center={MAP_CENTER} zoom={14} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark matter OSM tiles
            />

            {/* Change center when selection changes */}
            <ChangeMapView center={selectedLocation || userCoords} />

            {/* User Location Marker */}
            {userCoords && (
              <Marker position={userCoords} icon={createCustomIcon('var(--info)', '📍')}>
                <Popup>
                  <div style={{ color: '#000' }}>
                    <strong>Your Location</strong>
                    <br />Coordinates: {userCoords[0].toFixed(4)}, {userCoords[1].toFixed(4)}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Danger Zones Overlay */}
            {showDangerZones && DANGER_ZONES.map(zone => (
              <Circle
                key={zone.id}
                center={zone.center}
                radius={zone.radius}
                pathOptions={{ 
                  color: 'red', 
                  fillColor: '#ff4b5c', 
                  fillOpacity: 0.25, 
                  weight: 2,
                  className: 'leaflet-danger-zone'
                }}
              >
                <Popup>
                  <div style={{ color: '#000' }}>
                    <strong>⚠️ {zone.label}</strong>
                    <br />Highly dangerous area. Avoid routing here.
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Shelter Markers */}
            {showShelters && shelters.map(shelter => (
              <Marker 
                key={shelter.id} 
                position={[shelter.lat, shelter.lng]} 
                icon={createCustomIcon('var(--success)', '🏡')}
              >
                <Popup>
                  <div style={{ color: '#000', width: '200px' }}>
                    <strong style={{ fontSize: '1.05rem' }}>🏡 {shelter.name}</strong>
                    <hr style={{ margin: '5px 0' }} />
                    <strong>Capacity:</strong> {shelter.occupancy}/{shelter.capacity} ({(shelter.capacity - shelter.occupancy)} free)
                    <br /><strong>Resources:</strong> Food: {shelter.food}, Water: {shelter.water}
                    <br /><strong>Medical:</strong> {shelter.medical}
                    <div style={{ marginTop: '10px' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem', width: '100%' }}
                        onClick={() => calculateSafeRoute(shelter)}
                      >
                        Find Safe Route
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Hospital Markers */}
            {showHospitals && hospitals.map(hosp => (
              <Marker 
                key={hosp.id} 
                position={[hosp.lat, hosp.lng]} 
                icon={createCustomIcon('#3c6382', '🏥')}
              >
                <Popup>
                  <div style={{ color: '#000', width: '200px' }}>
                    <strong style={{ fontSize: '1.05rem' }}>🏥 {hosp.name}</strong>
                    <hr style={{ margin: '5px 0' }} />
                    <strong>Status:</strong> {hosp.status}
                    <br /><strong>Contact:</strong> {hosp.phone}
                    <div style={{ marginTop: '10px' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem', width: '100%' }}
                        onClick={() => calculateSafeRoute(hosp)}
                      >
                        Find Safe Route
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Community Reports Markers */}
            {showReports && reports.map(report => (
              <Marker 
                key={report.id} 
                position={[report.lat, report.lng]} 
                icon={createCustomIcon('var(--warning)', '⚠️')}
              >
                <Popup>
                  <div style={{ color: '#000', width: '220px' }}>
                    <strong style={{ fontSize: '1.05rem' }}>⚠️ {report.title}</strong>
                    <span style={{ fontSize: '0.7rem', display: 'block', color: '#666' }}>{report.category}</span>
                    <hr style={{ margin: '5px 0' }} />
                    <p style={{ fontSize: '0.85rem' }}>{report.description}</p>
                    <strong>Severity:</strong> {report.severity}
                    {report.photo && (
                      <div style={{ marginTop: '8px' }}>
                        <img src={report.photo} alt="Report attachment" style={{ width: '100%', borderRadius: '4px', maxHeight: '100px', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Community Shared Supplies Markers */}
            {showSharedSupplies && sharedSupplies && sharedSupplies.map(supply => (
              supply.status !== 'Claimed' && (
                <Marker 
                  key={supply.id} 
                  position={[supply.lat, supply.lng]} 
                  icon={createCustomIcon('#3b5998', '⭐')}
                >
                  <Popup>
                    <div style={{ color: '#000', width: '220px' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--info)' }}>⭐ Shared Supply</strong>
                      <span style={{ fontSize: '0.75rem', display: 'block', color: '#666' }}>Offered by: {supply.providerName}</span>
                      <hr style={{ margin: '5px 0' }} />
                      <strong>Item:</strong> {supply.itemType}
                      <br /><strong>Quantity:</strong> {supply.quantity}
                      <p style={{ fontSize: '0.85rem', marginTop: '5px', background: '#f5f6fa', padding: '5px', borderRadius: '4px' }}>{supply.details}</p>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}

            {/* Active SOS Markers */}
            {emergencies.map(sos => (
              sos.status !== 'Completed' && (
                <Marker 
                  key={sos.id} 
                  position={[sos.lat, sos.lng]} 
                  icon={createCustomIcon('var(--primary)', '🚨')}
                >
                  <Popup>
                    <div style={{ color: '#000', width: '200px' }}>
                      <strong style={{ fontSize: '1.05rem' }}>🚨 SOS: {sos.name}</strong>
                      <hr style={{ margin: '5px 0' }} />
                      <strong>Type:</strong> {sos.disasterType} ({sos.severity})
                      <br /><strong>People:</strong> {sos.affectedPeople}
                      <br /><strong>Status:</strong> {sos.status}
                    </div>
                  </Popup>
                </Marker>
              )
            ))}

            {/* Routed Path Polyline */}
            {routeCoordinates.length > 0 && (
              <Polyline 
                positions={routeCoordinates} 
                pathOptions={{ 
                  color: 'var(--info)', 
                  weight: 5, 
                  dashArray: '10, 10', 
                  className: 'map-routing-path' 
                }} 
              />
            )}
          </MapContainer>
        </div>

        {/* AI Route Planner Info Panel */}
        {routingTarget && routeInfo && (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                <ShieldCheck className="text-success" size={20} />
                AI Safe Route
              </h3>
              <button 
                onClick={clearRoute}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <EyeOff size={16} /> Clear
              </button>
            </div>
            
            <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Destination:</span>
                <div style={{ fontWeight: '600' }}>{routingTarget.name}</div>
              </div>
              <hr style={{ borderColor: 'var(--border-color)' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Distance:</span>
                  <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--info)' }}>{routeInfo.distance}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Time (Foot):</span>
                  <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--info)' }}>{routeInfo.time}</div>
                </div>
              </div>
              
              <hr style={{ borderColor: 'var(--border-color)' }} />
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Path Risk Level:</span>
                <div style={{ fontWeight: '700', color: routeInfo.riskColor }}>{routeInfo.risk}</div>
              </div>
              
              <div style={{ 
                background: 'rgba(46, 134, 222, 0.05)', 
                border: '1px solid rgba(46, 134, 222, 0.15)',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '0.8rem',
                marginTop: '10px',
                color: 'var(--text-secondary)'
              }}>
                {routeInfo.description}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
