import React, { useState } from 'react';
import { Settings, ShieldAlert, FileText, Send, Users, MapPin, Trash2 } from 'lucide-react';
import AnalyticsView from './AnalyticsView';

export default function AdminConsole({
  backendUrl,
  emergencies = [],
  reports = [],
  volunteers = [],
  shelters = [],
  sharedSupplies = [],
  analyticsData,
  onBroadcastAlert,
  onUpdateEmergencyStatus,
  onUpdateShelterStatus,
  onLocateItem
}) {
  const [activeSubTab, setActiveSubTab] = useState('emergencies');
  const [alertForm, setAlertForm] = useState({
    title: '',
    message: '',
    severity: 'Critical',
    category: 'Disaster Warning'
  });
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [simulationForm, setSimulationForm] = useState({
    disasterType: 'Flood',
    lat: '37.7800',
    lng: '-122.4200',
    areaName: 'Civic Center'
  });
  const [isSimulating, setIsSimulating] = useState(false);

  const activeSOS = emergencies.filter(e => e.status !== 'Completed');
  const availableVolunteers = volunteers.filter(v => v.status === 'Available');

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setIsBroadcasting(true);

    try {
      if (onBroadcastAlert) {
        await onBroadcastAlert(alertForm);
      }
      setSuccessMsg("Emergency broadcast alert dispatched to all active citizens.");
      setAlertForm({
        title: '',
        message: '',
        severity: 'Critical',
        category: 'Disaster Warning'
      });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert("Failed to broadcast alert.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleAssignVolunteer = async (emergencyId, volunteerId) => {
    if (!volunteerId) return;
    if (onUpdateEmergencyStatus) {
      await onUpdateEmergencyStatus(emergencyId, 'Help Assigned', volunteerId);
    }
  };

  const handleDismissReport = async (reportId) => {
    try {
      const res = await fetch(`${backendUrl}/api/reports/${reportId}`, {
        method: 'DELETE'
      });
      // We can also just filter it out locally if delete isn't fully implemented in DB,
      // but let's notify parent
      alert("Community report has been resolved/archived.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setIsSimulating(true);
    try {
      const res = await fetch(`${backendUrl}/api/admin/simulate-disaster`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disasterType: simulationForm.disasterType,
          lat: Number(simulationForm.lat),
          lng: Number(simulationForm.lng),
          areaName: simulationForm.areaName
        })
      });
      if (res.ok) {
        setSuccessMsg(`Simulated disaster event (${simulationForm.disasterType}) successfully triggered! Check Map and Alerts.`);
        if (onBroadcastAlert) onBroadcastAlert(); // trigger refresh
      }
    } catch (err) {
      console.error(err);
      alert("Simulation failed.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleClaimSupply = async (supplyId) => {
    try {
      const res = await fetch(`${backendUrl}/api/shared-supplies/${supplyId}/claim`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Claimed' })
      });
      if (res.ok) {
        setSuccessMsg("Community resource claimed/dispatched successfully.");
        if (onBroadcastAlert) onBroadcastAlert(); // refresh
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="glass-panel" style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings className="text-primary" size={24} />
          Admin Command Center
        </h2>
        
        {/* Navigation within Admin panel */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`quick-action-btn ${activeSubTab === 'emergencies' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('emergencies')}
            style={{ borderColor: activeSubTab === 'emergencies' ? 'var(--primary)' : 'var(--border-color)' }}
          >
            SOS Queue
          </button>
          <button 
            className={`quick-action-btn ${activeSubTab === 'broadcast' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('broadcast')}
            style={{ borderColor: activeSubTab === 'broadcast' ? 'var(--primary)' : 'var(--border-color)' }}
          >
            Broadcast Warnings
          </button>
          <button 
            className={`quick-action-btn ${activeSubTab === 'hazards' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('hazards')}
            style={{ borderColor: activeSubTab === 'hazards' ? 'var(--primary)' : 'var(--border-color)' }}
          >
            Community Reports
          </button>
          <button 
            className={`quick-action-btn ${activeSubTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('analytics')}
            style={{ borderColor: activeSubTab === 'analytics' ? 'var(--primary)' : 'var(--border-color)' }}
          >
            Live Analytics
          </button>
          <button 
            className={`quick-action-btn ${activeSubTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('simulator')}
            style={{ borderColor: activeSubTab === 'simulator' ? 'var(--primary)' : 'var(--border-color)' }}
          >
            Disaster Simulator
          </button>
          <button 
            className={`quick-action-btn ${activeSubTab === 'supplies' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('supplies')}
            style={{ borderColor: activeSubTab === 'supplies' ? 'var(--primary)' : 'var(--border-color)' }}
          >
            Shared Supplies
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ 
          background: 'rgba(29, 209, 161, 0.08)',
          border: '1px solid rgba(29, 209, 161, 0.25)',
          borderRadius: '8px',
          padding: '12px',
          color: 'var(--success)',
          fontSize: '0.85rem',
          marginBottom: '20px'
        }}>
          {successMsg}
        </div>
      )}

      {/* SUB-TABS */}
      
      {/* 1. SOS Queue */}
      {activeSubTab === 'emergencies' && (
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: 'var(--text-primary)' }}>Active SOS Requests</h3>
          <div className="card-list">
            {activeSOS.map(sos => (
              <div key={sos.id} className="list-card" style={{ borderLeft: '3px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: '#fff' }}>SOS Signal: {sos.name}</h4>
                    <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Phone: {sos.phone} | Created: {new Date(sos.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <span className="badge badge-critical">{sos.status}</span>
                </div>

                <div style={{ marginTop: '10px', fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div><strong>Disaster:</strong> {sos.disasterType} ({sos.severity})</div>
                  <div><strong>Group Size:</strong> {sos.affectedPeople}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong>Medical/Injuries:</strong> {sos.injuries}</div>
                </div>

                <div style={{ marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => onLocateItem([sos.lat, sos.lng])}
                  >
                    Locate GPS
                  </button>

                  {sos.status === 'Waiting for Rescue' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assign Volunteer:</span>
                      <select 
                        className="form-control" 
                        style={{ width: '180px', padding: '4px 8px', fontSize: '0.8rem' }}
                        defaultValue=""
                        onChange={(e) => handleAssignVolunteer(sos.id, e.target.value)}
                      >
                        <option value="" disabled>-- Choose Available --</option>
                        {availableVolunteers.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assigned to:</span>
                      <strong style={{ color: 'var(--success)', fontSize: '0.85rem' }}>
                        {volunteers.find(v => v.id === sos.volunteerId)?.name || 'Rescue Squad'}
                      </strong>
                      <button 
                        className="btn btn-success" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => onUpdateEmergencyStatus(sos.id, 'Completed')}
                      >
                        Mark Completed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {activeSOS.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                No active SOS signals reported. System secure.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Broadcast Warnings */}
      {activeSubTab === 'broadcast' && (
        <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>Broadcast Alert warning</h3>
          
          <div className="form-group">
            <label className="form-label">Alert Header / Title</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Flash Flood Emergency: Evacuation Order"
              value={alertForm.title}
              onChange={e => setAlertForm({...alertForm, title: e.target.value})}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Warning Category</label>
              <select 
                className="form-control"
                value={alertForm.category}
                onChange={e => setAlertForm({...alertForm, category: e.target.value})}
              >
                <option value="Disaster Warning">Disaster Warning</option>
                <option value="Evacuation Alert">Evacuation Alert</option>
                <option value="Shelter Update">Shelter Update</option>
                <option value="Weather Alert">Weather Alert</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Threat Severity</label>
              <select 
                className="form-control"
                value={alertForm.severity}
                onChange={e => setAlertForm({...alertForm, severity: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Alert Message (Instructions to citizens)</label>
            <textarea 
              className="form-control"
              rows="4"
              placeholder="Provide clear directions. e.g. Rising waters near River delta. Residents must head to Downtown Civic Center immediately. Avoid Broadway subway station."
              value={alertForm.message}
              onChange={e => setAlertForm({...alertForm, message: e.target.value})}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
            disabled={isBroadcasting}
          >
            <Send size={18} /> {isBroadcasting ? 'Sending Alert...' : 'Dispatch Broadcast Alert'}
          </button>
        </form>
      )}

      {/* 3. Community Reports Audit */}
      {activeSubTab === 'hazards' && (
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: 'var(--text-primary)' }}>Community Hazards Feed</h3>
          <div className="card-list">
            {reports.map(report => (
              <div key={report.id} className="list-card" style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '1rem', color: '#fff' }}>{report.title}</h4>
                    <span className={`badge ${report.severity === 'Critical' ? 'badge-critical' : 'badge-high'}`}>{report.severity}</span>
                  </div>
                  <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{report.category} | Created: {new Date(report.createdAt).toLocaleTimeString()}</span>
                  
                  <p className="text-secondary" style={{ margin: '10px 0', fontSize: '0.85rem' }}>{report.description}</p>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => onLocateItem([report.lat, report.lng])}
                    >
                      Locate
                    </button>
                  </div>
                </div>

                {report.photo && (
                  <img src={report.photo} alt={report.title} style={{ width: '80px', height: '80px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                )}
              </div>
            ))}

            {reports.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                No hazard reports logged by citizens.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Live Analytics Dashboard */}
      {activeSubTab === 'analytics' && (
        <AnalyticsView analyticsData={analyticsData} />
      )}

      {/* 5. Disaster Simulator */}
      {activeSubTab === 'simulator' && (
        <form onSubmit={handleSimulate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>Disaster Simulation Engine</h3>
          <p className="text-secondary" style={{ fontSize: '0.8rem' }}>
            Simulate disaster incidents in real-time. This spawns active Danger Zones, alerts citizens, and logs SOS signals.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Disaster Type</label>
              <select 
                className="form-control"
                value={simulationForm.disasterType}
                onChange={e => setSimulationForm({...simulationForm, disasterType: e.target.value})}
              >
                <option value="Flood">Flood</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Fire">Fire</option>
                <option value="Cyclone">Cyclone</option>
                <option value="Landslide">Landslide</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Area Name / Label</label>
              <input 
                type="text" 
                className="form-control"
                value={simulationForm.areaName}
                onChange={e => setSimulationForm({...simulationForm, areaName: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Simulator Latitude</label>
              <input 
                type="number" 
                step="any"
                className="form-control"
                value={simulationForm.lat}
                onChange={e => setSimulationForm({...simulationForm, lat: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Simulator Longitude</label>
              <input 
                type="number" 
                step="any"
                className="form-control"
                value={simulationForm.lng}
                onChange={e => setSimulationForm({...simulationForm, lng: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-warning" 
            style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
            disabled={isSimulating}
          >
            🚨 {isSimulating ? 'Simulating...' : 'Inject Simulated Disaster'}
          </button>
        </form>
      )}

      {/* 6. Community Supplies Manager */}
      {activeSubTab === 'supplies' && (
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: 'var(--text-primary)' }}>Shared Community Resources</h3>
          <div className="card-list">
            {sharedSupplies.map(supply => (
              <div key={supply.id} className="list-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid var(--info)' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#fff' }}>⭐ {supply.itemType} ({supply.quantity} units)</h4>
                  <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Provided by: {supply.providerName} | Status: <strong style={{ color: supply.status === 'Available' ? 'var(--success)' : 'var(--primary)' }}>{supply.status}</strong></span>
                  <p className="text-secondary" style={{ marginTop: '8px', fontSize: '0.85rem' }}>{supply.details}</p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => onLocateItem([supply.lat, supply.lng])}
                  >
                    Locate
                  </button>
                  {supply.status === 'Available' && (
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--info)' }}
                      onClick={() => handleClaimSupply(supply.id)}
                    >
                      Dispatch/Claim
                    </button>
                  )}
                </div>
              </div>
            ))}

            {sharedSupplies.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                No community shared supplies registered in this sector.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
