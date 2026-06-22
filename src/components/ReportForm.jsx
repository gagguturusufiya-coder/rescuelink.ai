import React, { useState } from 'react';
import { Camera, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ReportForm({ backendUrl, onReportSubmitted }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Flooded roads',
    severity: 'Medium',
    lat: '',
    lng: ''
  });
  const [photo, setPhoto] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle image conversion to Base64
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6)
        });
        setIsLocating(false);
      },
      (error) => {
        console.warn("Location error. Mocking coordinates.", error);
        // Mock coordinates close to default center
        setFormData({
          ...formData,
          lat: (37.7749 + (Math.random() - 0.5) * 0.015).toFixed(6),
          lng: (-122.4194 + (Math.random() - 0.5) * 0.015).toFixed(6)
        });
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lng) {
      alert("Please capture your coordinates before submitting.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...formData,
      lat: Number(formData.lat),
      lng: Number(formData.lng),
      photo
    };

    try {
      const res = await fetch(`${backendUrl}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to submit report");

      const data = await res.json();
      setSuccessMessage("Incident reported successfully! It is now visible on the emergency dashboard map.");
      
      if (onReportSubmitted) {
        onReportSubmitted(data);
      }

      // Reset Form
      setFormData({
        title: '',
        description: '',
        category: 'Flooded roads',
        severity: 'Medium',
        lat: '',
        lng: ''
      });
      setPhoto(null);

      // Clear success after 4 seconds
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error(err);
      alert("Could not post emergency report. Check server connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
        <AlertTriangle className="text-warning" size={24} />
        <h2 style={{ fontSize: '1.25rem' }}>Report Community Hazard</h2>
      </div>

      <p className="text-secondary" style={{ fontSize: '0.8rem', marginBottom: '20px' }}>
        Help rescue squads and citizens stay informed. Report blocked roads, falling hazards, damaged utility grids, or unsafe areas.
      </p>

      {successMessage && (
        <div style={{ 
          background: 'rgba(29, 209, 161, 0.08)',
          border: '1px solid rgba(29, 209, 161, 0.25)',
          borderRadius: '8px',
          padding: '12px',
          color: 'var(--success)',
          fontSize: '0.85rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div className="form-group">
          <label className="form-label">Hazard Summary / Title</label>
          <input 
            type="text" 
            className="form-control"
            placeholder="e.g. Main road flooded near highway"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              className="form-control"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="Flooded roads">Flooded roads</option>
              <option value="Fallen trees">Fallen trees</option>
              <option value="Missing people">Missing people</option>
              <option value="Damaged buildings">Damaged buildings</option>
              <option value="Unsafe areas">Unsafe areas</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Severity Level</label>
            <select 
              className="form-control"
              value={formData.severity}
              onChange={e => setFormData({...formData, severity: e.target.value})}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description & Details</label>
          <textarea 
            className="form-control"
            rows="3"
            placeholder="Describe the nature of the danger, blockage size, or other context..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        {/* Location Picker */}
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Attach Coordinates</span>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={captureLocation}
              disabled={isLocating}
            >
              <MapPin size={12} /> {isLocating ? 'Locating...' : 'Get GPS'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Latitude</label>
              <input 
                type="number" 
                step="any"
                className="form-control" 
                value={formData.lat}
                onChange={e => setFormData({...formData, lat: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Longitude</label>
              <input 
                type="number" 
                step="any"
                className="form-control" 
                value={formData.lng}
                onChange={e => setFormData({...formData, lng: e.target.value})}
                required
              />
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="form-group">
          <label className="form-label">Upload Evidence Photo</label>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <label style={{ 
              background: 'rgba(255,255,255,0.04)', 
              border: '1px dashed var(--border-color)', 
              borderRadius: '8px', 
              padding: '15px', 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              width: '100px',
              textAlign: 'center'
            }}>
              <Camera size={20} className="text-secondary" />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Choose Photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </label>
            
            {photo && (
              <div style={{ position: 'relative' }}>
                <img src={photo} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                <button 
                  type="button" 
                  onClick={() => setPhoto(null)}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  X
                </button>
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-warning" 
          style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Posting Hazard...' : 'Broadcast Report'}
        </button>
      </form>
    </div>
  );
}
