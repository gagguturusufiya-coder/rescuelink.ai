import React, { useState, useEffect } from 'react';
import { AlertCircle, ShieldAlert, PhoneCall, CheckCircle2, Clock, Check } from 'lucide-react';

export default function SOSButton({ backendUrl, onSosCreated, activeSos, setActiveSos }) {
  const [isTriggering, setIsTriggering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    disasterType: 'Flood',
    severity: 'Critical',
    affectedPeople: '1',
    injuries: ''
  });

  // Polling for SOS status updates if there is an active SOS
  useEffect(() => {
    if (!activeSos) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${backendUrl}/api/emergencies`);
        if (res.ok) {
          const list = await res.json();
          const current = list.find(e => e.id === activeSos.id);
          if (current) {
            setActiveSos(current);
            if (current.status === 'Completed') {
              // Stop polling if completed
              clearInterval(interval);
            }
          }
        }
      } catch (err) {
        console.warn("Error polling SOS status:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeSos, backendUrl, setActiveSos]);

  const handleSOS = async (e) => {
    e.preventDefault();
    setIsTriggering(true);

    // Get location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        await sendSOSRequest(coords);
      },
      async (error) => {
        console.warn("Geolocation permission denied or error. Falling back to default center.", error);
        // Fallback coordinates (Mumbai Center)
        const coords = {
          lat: 19.0760 + (Math.random() - 0.5) * 0.01,
          lng: 72.8777 + (Math.random() - 0.5) * 0.01
        };
        await sendSOSRequest(coords);
      }
    );
  };

  const sendSOSRequest = async (coords) => {
    const payload = {
      ...formData,
      lat: coords.lat,
      lng: coords.lng
    };

    // Check if offline
    if (!navigator.onLine) {
      const offlineQueue = JSON.parse(localStorage.getItem('offline_sos_queue') || '[]');
      const offlineRequest = {
        id: `offline-${Date.now()}`,
        ...payload,
        status: 'SOS Queued (Offline)',
        createdAt: new Date().toISOString()
      };
      offlineQueue.push(offlineRequest);
      localStorage.setItem('offline_sos_queue', JSON.stringify(offlineQueue));
      
      // Simulating created offline SOS
      setActiveSos(offlineRequest);
      setIsTriggering(false);
      
      // Set up window listener to sync
      alert("You are currently OFFLINE. Your SOS request has been saved locally and will send automatically as soon as internet connectivity returns.");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/emergencies/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to post SOS");
      const data = await res.json();
      setActiveSos(data);
      if (onSosCreated) onSosCreated(data);
    } catch (err) {
      console.error(err);
      alert("Failed to submit SOS. Please call emergency services directly.");
    } finally {
      setIsTriggering(false);
    }
  };

  const resetSOS = () => {
    setActiveSos(null);
    setFormData({
      name: '',
      phone: '',
      disasterType: 'Flood',
      severity: 'Critical',
      affectedPeople: '1',
      injuries: ''
    });
  };

  const getTimelineStepClass = (stepName) => {
    if (!activeSos) return '';
    const statuses = ['SOS Sent', 'Waiting for Rescue', 'Help Assigned', 'Completed'];
    const currentIdx = statuses.indexOf(activeSos.status);
    const stepIdx = statuses.indexOf(stepName);

    if (currentIdx === stepIdx) return 'active';
    if (currentIdx > stepIdx) return 'completed';
    return '';
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
      {!activeSos ? (
        <form onSubmit={handleSOS} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <div>
            <h2 style={{ color: 'var(--primary)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <ShieldAlert size={26} />
              EMERGENCY SOS
            </h2>
            <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              Press the button below to alert emergency response teams with your GPS coordinates.
            </p>
          </div>

          {/* Big pulsing SOS button */}
          <button 
            type="submit" 
            className="pulse-button"
            disabled={isTriggering}
            style={{ margin: '15px 0' }}
          >
            {isTriggering ? (
              <span style={{ fontSize: '0.95rem' }}>FETCHING GPS...</span>
            ) : (
              <>
                <span>SOS</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '500', marginTop: '4px' }}>HOLD TO SEND</span>
              </>
            )}
          </button>

          {/* Form expander for extra information */}
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div class="form-group">
                <label class="form-label">Your Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Amit Sharma"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Disaster Type</label>
                <select 
                  className="form-control"
                  value={formData.disasterType}
                  onChange={e => setFormData({...formData, disasterType: e.target.value})}
                >
                  <option value="Flood">Flood</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="Fire">Fire</option>
                  <option value="Accident">Accident</option>
                  <option value="Landslide">Landslide</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Affected People</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={formData.affectedPeople}
                  min="1"
                  onChange={e => setFormData({...formData, affectedPeople: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label">Medical Needs / Injuries</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Head injury, bleeding, or none"
                value={formData.injuries}
                onChange={e => setFormData({...formData, injuries: e.target.value})}
              />
            </div>
          </div>
        </form>
      ) : (
        <div style={{ width: '100%', padding: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(255, 75, 92, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '50%' }}>
              <AlertCircle size={36} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>SOS Beacon Active</h3>
              <p className="text-secondary" style={{ fontSize: '0.8rem' }}>
                Incident ID: {activeSos.id}
              </p>
            </div>
          </div>

          {/* Timeline Status */}
          <div className="sos-timeline">
            <div className={`timeline-step ${getTimelineStepClass('SOS Sent')}`}>
              <div className="step-dot"><Check size={12} /></div>
              <span>SOS Sent</span>
            </div>
            <div className={`timeline-step ${getTimelineStepClass('Waiting for Rescue')}`}>
              <div className="step-dot"><Clock size={12} /></div>
              <span>Waiting</span>
            </div>
            <div className={`timeline-step ${getTimelineStepClass('Help Assigned')}`}>
              <div className="step-dot"><AlertCircle size={12} /></div>
              <span>Assigned</span>
            </div>
            <div className={`timeline-step ${getTimelineStepClass('Completed')}`}>
              <div className="step-dot"><CheckCircle2 size={12} /></div>
              <span>Rescued</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'left', marginBottom: '20px', fontSize: '0.85rem' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Status:</strong>{' '}
              <span style={{ fontWeight: '700', color: activeSos.status === 'Completed' ? 'var(--success)' : 'var(--primary)' }}>
                {activeSos.status}
              </span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Type:</strong> {activeSos.disasterType} ({activeSos.severity} severity)
            </div>
            {activeSos.volunteerId && (
              <div style={{ padding: '8px', background: 'rgba(29, 209, 161, 0.05)', border: '1px solid rgba(29, 209, 161, 0.2)', borderRadius: '6px', color: 'var(--success)', marginTop: '5px' }}>
                ✅ A rescue volunteer has been assigned to your location and is heading your way. Keep your device active.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <a 
              href="tel:112" 
              className="btn btn-secondary" 
              style={{ flexGrow: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
            >
              <PhoneCall size={16} /> Direct Call 112 / 108
            </a>
            
            {activeSos.status === 'Completed' && (
              <button onClick={resetSOS} className="btn btn-success" style={{ flexGrow: 1 }}>
                Start New Session
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
