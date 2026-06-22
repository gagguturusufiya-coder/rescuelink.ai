import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MapDashboard from './components/MapDashboard';
import AIChatBot from './components/AIChatBot';
import SOSButton from './components/SOSButton';
import ShelterFinder from './components/ShelterFinder';
import MedicalGuide from './components/MedicalGuide';
import ReportForm from './components/ReportForm';
import VolunteerHub from './components/VolunteerHub';
import AdminConsole from './components/AdminConsole';
import MissingPersons from './components/MissingPersons';
import ShareSuppliesForm from './components/ShareSuppliesForm';
import { AlertOctagon, PhoneCall, ShieldAlert, WifiOff, Users, HeartPulse, Info } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [userRole, setUserRole] = useState('citizen'); // citizen, volunteer, admin
  
  // Data States
  const [shelters, setShelters] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [reports, setReports] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [missingPersons, setMissingPersons] = useState([]);
  const [sharedSupplies, setSharedSupplies] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  
  // Interactive States
  const [activeSos, setActiveSos] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Load initial data
  const fetchData = async () => {
    try {
      const [resShelters, resEmergencies, resReports, resVolunteers, resMissing, resAlerts, resAnalytics, resShared] = await Promise.all([
        fetch(`${BACKEND_URL}/api/shelters`),
        fetch(`${BACKEND_URL}/api/emergencies`),
        fetch(`${BACKEND_URL}/api/reports`),
        fetch(`${BACKEND_URL}/api/volunteers`),
        fetch(`${BACKEND_URL}/api/missing-persons`),
        fetch(`${BACKEND_URL}/api/alerts`),
        fetch(`${BACKEND_URL}/api/analytics`),
        fetch(`${BACKEND_URL}/api/shared-supplies`)
      ]);

      if (resShelters.ok) setShelters(await resShelters.json());
      if (resEmergencies.ok) setEmergencies(await resEmergencies.json());
      if (resReports.ok) setReports(await resReports.json());
      if (resVolunteers.ok) setVolunteers(await resVolunteers.json());
      if (resMissing.ok) setMissingPersons(await resMissing.json());
      if (resAlerts.ok) setAlerts(await resAlerts.json());
      if (resAnalytics.ok) setAnalyticsData(await resAnalytics.json());
      if (resShared.ok) setSharedSupplies(await resShared.json());
    } catch (error) {
      console.warn("Failed to fetch from backend. Running in offline/fallback mode:", error.message);
      setIsOffline(true);
      // Load from localStorage or mock
      loadOfflineFallbackData();
    }
  };

  const loadOfflineFallbackData = () => {
    // Basic cached offline values
    const cachedShelters = [
      { id: "shelter-1", name: "Dharavi Town Hall Shelter (Offline Stored)", lat: 19.0400, lng: 72.8500, distance: "0.8 km", capacity: 350, occupancy: 240, food: "High", water: "High", medical: "Full Support" },
      { id: "shelter-2", name: "Bandra Sports Complex Complex (Offline Stored)", lat: 19.0600, lng: 72.8300, distance: "2.5 km", capacity: 500, occupancy: 120, food: "Medium", water: "High", medical: "Basic First Aid" }
    ];
    setShelters(cachedShelters);
    setAlerts([
      { id: "offline-alert-1", title: "OFFLINE MODE ENABLED", message: "You are disconnected from the network. Emergency telephone numbers and local first aid procedures remain fully active.", severity: "Critical" }
    ]);
  };

  useEffect(() => {
    fetchData();
    
    // Auto refresh data every 8 seconds
    const interval = setInterval(() => {
      if (navigator.onLine) {
        fetchData();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Offline Listeners
  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      console.log("Browser back online. Syncing queued actions...");
      
      // Sync Offline SOS Queue
      const offlineQueue = JSON.parse(localStorage.getItem('offline_sos_queue') || '[]');
      if (offlineQueue.length > 0) {
        for (const req of offlineQueue) {
          try {
            const res = await fetch(`${BACKEND_URL}/api/emergencies/sos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(req)
            });
            if (res.ok) {
              const data = await res.json();
              setActiveSos(data);
            }
          } catch (e) {
            console.error("Failed to sync offline SOS:", e);
          }
        }
        localStorage.removeItem('offline_sos_queue');
        alert("Connectivity Restored: Your offline SOS trigger was successfully transmitted to active rescue teams.");
      }
      fetchData();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // AI Voice Alerts (TTS) Accessibility
  const spokenAlertsRef = React.useRef(new Set());
  useEffect(() => {
    if (alerts.length === 0) return;
    alerts.forEach(alert => {
      if (!spokenAlertsRef.current.has(alert.id)) {
        spokenAlertsRef.current.add(alert.id);
        if (alert.severity === 'Critical' || alert.severity === 'High') {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const text = `Attention! Emergency warning. ${alert.title}. ${alert.message}`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
          }
        }
      }
    });
  }, [alerts]);

  // API Mutator Functions
  const handleUpdateShelter = async (id, editForm) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/shelters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterVolunteer = async (volForm) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/volunteers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(volForm)
      });
      if (res.ok) {
        const data = await res.json();
        fetchData();
        return data;
      } else {
        const err = await res.json();
        alert(err.error || "Failed to register.");
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const handleUpdateEmergencyStatus = async (id, status, volunteerId = null) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/emergencies/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, volunteerId })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBroadcastAlert = async (alertForm) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertForm)
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLocateItem = (coords) => {
    setSelectedLocation(coords);
    setActiveTab('map');
  };

  return (
    <div className="app-container">
      {/* Offline Status Warning Banner */}
      {isOffline && (
        <div className="offline-banner">
          <WifiOff size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Offline Mode Active: Standard Helplines & First Aid Vault operational. Actions will sync when online.
        </div>
      )}

      {/* Navigation Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={userRole} 
        setUserRole={setUserRole} 
      />

      {/* Active System Warnings Banner */}
      {alerts.length > 0 && (
        <div className="alerts-banner-container">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-item ${alert.severity}`}>
              <AlertOctagon className="text-primary" size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.85rem' }}>{alert.title} ({alert.severity} Threat)</strong>
                <p className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '2px' }}>{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Core Workspaces */}
      <main style={{ flexGrow: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'home' && (
          <div className="dashboard-grid">
            {/* Primary Column */}
            <div className="sidebar-panel">
              {/* Emergency Status Card */}
              <div className="glass-panel" style={{ background: 'rgba(255, 75, 92, 0.05)', borderColor: 'rgba(255, 75, 92, 0.2)' }}>
                <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                  <ShieldAlert size={22} />
                  Active disaster: Warning State
                </h2>
                <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '5px' }}>
                  A heavy flooding threat has been declared. Search & Rescue volunteers are stationed. Follow safety instructions.
                </p>
              </div>

              {/* AI chat assistant */}
              <AIChatBot backendUrl={BACKEND_URL} />
            </div>

            {/* Side Column */}
            <div className="sidebar-panel">
              {/* SOS Emergency button */}
              <SOSButton 
                backendUrl={BACKEND_URL} 
                onSosCreated={fetchData}
                activeSos={activeSos}
                setActiveSos={setActiveSos}
              />

              {/* Emergency numbers quick card */}
              <div className="glass-panel">
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PhoneCall size={16} className="text-info" />
                  Offline Helplines
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                  <a href="tel:112" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: '#fff', textAlign: 'center' }}>
                    📞 **National 112**
                  </a>
                  <a href="tel:1078" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: '#fff', textAlign: 'center' }}>
                    📞 **NDRF 1078**
                  </a>
                </div>
              </div>

              {/* Emergency Supply Kit Recommendation Checklist */}
              <div className="glass-panel">
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={16} className="text-warning" />
                  Emergency Supplies kit
                </h3>
                <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '8px' }}>
                  <strong>Flood checklist:</strong>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" defaultChecked /> Clean Drinking Water (3L/person)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" defaultChecked /> Dry Food & Rations
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" /> Torch / Waterproof Flashlight
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" /> Essential Medicines & First Aid
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="main-map-panel">
            <MapDashboard 
              shelters={shelters} 
              emergencies={emergencies} 
              reports={reports}
              sharedSupplies={sharedSupplies}
              selectedLocation={selectedLocation}
            />
          </div>
        )}

        {activeTab === 'shelters' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 1.2fr', gap: '20px', height: '100%' }}>
            <ShelterFinder 
              shelters={shelters} 
              onUpdateShelter={handleUpdateShelter}
              userRole={userRole}
              onLocateShelter={handleLocateItem}
            />
            <div className="main-map-panel">
              <MapDashboard 
                shelters={shelters} 
                emergencies={emergencies} 
                reports={reports}
                sharedSupplies={sharedSupplies}
                selectedLocation={selectedLocation}
              />
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: '100%' }}>
            <MedicalGuide />
            <div className="main-map-panel">
              <MapDashboard 
                shelters={shelters} 
                emergencies={emergencies} 
                reports={reports}
                sharedSupplies={sharedSupplies}
                selectedLocation={selectedLocation}
              />
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 1.2fr', gap: '20px', height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: 'calc(100vh - 130px)', overflowY: 'auto', paddingRight: '5px' }}>
              <ReportForm 
                backendUrl={BACKEND_URL}
                onReportSubmitted={fetchData}
              />
              <ShareSuppliesForm
                backendUrl={BACKEND_URL}
                onSupplySubmitted={fetchData}
              />
              <MissingPersons 
                backendUrl={BACKEND_URL}
                missingPersons={missingPersons}
                onPersonReported={fetchData}
              />
            </div>
            <div className="main-map-panel">
              <MapDashboard 
                shelters={shelters} 
                emergencies={emergencies} 
                reports={reports}
                sharedSupplies={sharedSupplies}
                selectedLocation={selectedLocation}
              />
            </div>
          </div>
        )}

        {activeTab === 'volunteer-hub' && userRole === 'volunteer' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px', height: '100%' }}>
            <VolunteerHub 
              backendUrl={BACKEND_URL}
              volunteers={volunteers}
              emergencies={emergencies}
              onRegisterVolunteer={handleRegisterVolunteer}
              onUpdateEmergencyStatus={handleUpdateEmergencyStatus}
              onLocateEmergency={handleLocateItem}
            />
            <div className="main-map-panel">
              <MapDashboard 
                shelters={shelters} 
                emergencies={emergencies} 
                reports={reports}
                sharedSupplies={sharedSupplies}
                selectedLocation={selectedLocation}
              />
            </div>
          </div>
        )}

        {activeTab === 'admin' && userRole === 'admin' && (
          <AdminConsole 
            backendUrl={BACKEND_URL}
            emergencies={emergencies}
            reports={reports}
            volunteers={volunteers}
            shelters={shelters}
            sharedSupplies={sharedSupplies}
            analyticsData={analyticsData}
            onBroadcastAlert={handleBroadcastAlert}
            onUpdateEmergencyStatus={handleUpdateEmergencyStatus}
            onLocateItem={handleLocateItem}
          />
        )}
      </main>
    </div>
  );
}
