import React, { useState } from 'react';
import { ShieldCheck, UserPlus, AlertCircle, CheckCircle, Navigation } from 'lucide-react';

export default function VolunteerHub({ 
  backendUrl, 
  volunteers = [], 
  emergencies = [], 
  onRegisterVolunteer,
  onUpdateEmergencyStatus,
  onLocateEmergency 
}) {
  const [activeVolId, setActiveVolId] = useState(volunteers[0]?.id || '');
  const [showRegForm, setShowRegForm] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    skills: ''
  });
  
  const activeVolunteer = volunteers.find(v => v.id === activeVolId);
  const pendingEmergencies = emergencies.filter(e => e.status === 'Waiting for Rescue');
  
  // Find current emergency assigned to this volunteer
  const activeMission = emergencies.find(e => 
    e.volunteerId === activeVolId && e.status === 'Help Assigned'
  );

  const handleRegister = async (e) => {
    e.preventDefault();
    const skillsArray = regForm.skills.split(',').map(s => s.trim()).filter(Boolean);
    
    if (onRegisterVolunteer) {
      const newVol = await onRegisterVolunteer({
        name: regForm.name,
        email: regForm.email,
        phone: regForm.phone,
        skills: skillsArray
      });
      if (newVol) {
        setActiveVolId(newVol.id);
        setShowRegForm(false);
        setRegForm({ name: '', email: '', phone: '', skills: '' });
      }
    }
  };

  const claimMission = async (emergencyId) => {
    if (!activeVolId) {
      alert("Please select or register a volunteer profile first.");
      return;
    }
    
    if (onUpdateEmergencyStatus) {
      await onUpdateEmergencyStatus(emergencyId, 'Help Assigned', activeVolId);
    }
  };

  const completeMission = async (emergencyId) => {
    if (onUpdateEmergencyStatus) {
      await onUpdateEmergencyStatus(emergencyId, 'Completed');
    }
  };

  return (
    <div className="glass-panel" style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🛡️ Volunteer Rescue Center
        </h2>
        
        <button 
          className="btn btn-secondary" 
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          onClick={() => setShowRegForm(!showRegForm)}
        >
          {showRegForm ? 'View Missions' : 'Register New Volunteer'}
        </button>
      </div>

      {showRegForm ? (
        /* Volunteer Registration Form */
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--success)' }}>Volunteer Enrollment</h3>
          
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Liam Neeson"
              value={regForm.name} 
              onChange={e => setRegForm({...regForm, name: e.target.value})} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="liam@rescuelink.org"
                value={regForm.email} 
                onChange={e => setRegForm({...regForm, email: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="+1 555-9876"
                value={regForm.phone} 
                onChange={e => setRegForm({...regForm, phone: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Specialist Skills (comma separated)</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. First Aid, Boat piloting, Heavy vehicle, CPR"
              value={regForm.skills} 
              onChange={e => setRegForm({...regForm, skills: e.target.value})} 
            />
          </div>

          <button type="submit" className="btn btn-success" style={{ padding: '10px', marginTop: '5px' }}>
            Join Rescue Network
          </button>
        </form>
      ) : (
        /* Missions Dashboard */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Volunteer Profile Selector */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Active Volunteer Profile:</label>
            <select 
              className="form-control"
              value={activeVolId}
              onChange={e => setActiveVolId(e.target.value)}
            >
              <option value="" disabled>-- Select Volunteer Profile --</option>
              {volunteers.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.status})</option>
              ))}
            </select>

            {activeVolunteer && (
              <div style={{ marginTop: '10px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Skills:</strong> {activeVolunteer.skills.join(', ') || 'General Support'}</div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span style={{ color: activeVolunteer.status === 'On Mission' ? 'var(--warning)' : 'var(--success)' }}>
                    {activeVolunteer.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Current Assigned Mission */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text-primary)' }}>Your Active Mission</h3>
            {activeMission ? (
              <div className="list-card" style={{ borderLeft: '3px solid var(--warning)', background: 'rgba(255, 159, 67, 0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: '#fff' }}>🚨 SOS from {activeMission.name}</h4>
                    <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Phone: {activeMission.phone}</span>
                  </div>
                  <span className="badge badge-high">On Mission</span>
                </div>
                
                <div style={{ marginTop: '10px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div><strong>Disaster:</strong> {activeMission.disasterType} (Severity: {activeMission.severity})</div>
                  <div><strong>Affected People:</strong> {activeMission.affectedPeople}</div>
                  <div><strong>Injuries:</strong> {activeMission.injuries}</div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', flexGrow: 1, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}
                    onClick={() => onLocateEmergency([activeMission.lat, activeMission.lng])}
                  >
                    <Navigation size={12} /> Map Route
                  </button>
                  <button 
                    className="btn btn-success" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', flexGrow: 1 }}
                    onClick={() => completeMission(activeMission.id)}
                  >
                    Complete Rescue
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ border: '1px dashed var(--border-color)', borderRadius: '10px', padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active missions assigned. Review pending requests below.
              </div>
            )}
          </div>

          {/* Pending Rescue Requests */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Pending SOS Signals</span>
              <span className="badge badge-critical">{pendingEmergencies.length}</span>
            </h3>

            <div className="card-list">
              {pendingEmergencies.map(sos => (
                <div key={sos.id} className="list-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>SOS Signal: {sos.name}</h4>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>Received: {new Date(sos.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <span className={`badge ${sos.severity === 'Critical' ? 'badge-critical' : 'badge-high'}`}>{sos.severity}</span>
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div><strong>Disaster:</strong> {sos.disasterType} | <strong>Group Size:</strong> {sos.affectedPeople}</div>
                    <div style={{ marginTop: '3px' }}><strong>Injuries:</strong> {sos.injuries}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => onLocateEmergency([sos.lat, sos.lng])}
                    >
                      Locate
                    </button>
                    <button 
                      className="btn btn-success" 
                      style={{ padding: '4px 10px', fontSize: '0.75rem', flexGrow: 1 }}
                      onClick={() => claimMission(sos.id)}
                    >
                      Claim Mission
                    </button>
                  </div>
                </div>
              ))}

              {pendingEmergencies.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No pending SOS signals in the system.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
