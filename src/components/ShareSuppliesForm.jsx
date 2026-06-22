import React, { useState } from 'react';
import { HeartHandshake, MapPin, Check } from 'lucide-react';

export default function ShareSuppliesForm({ backendUrl, onSupplySubmitted }) {
  const [formData, setFormData] = useState({
    providerName: '',
    itemType: 'Blankets & Clothing',
    quantity: '1',
    details: '',
    lat: '',
    lng: ''
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
      alert("Please capture coordinates to pin your supply location on the map.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${backendUrl}/api/shared-supplies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          providerName: formData.providerName,
          itemType: formData.itemType,
          quantity: Number(formData.quantity),
          details: formData.details,
          lat: Number(formData.lat),
          lng: Number(formData.lng)
        })
      });

      if (!res.ok) throw new Error("Failed to post supplies");
      
      setSuccess(true);
      setFormData({
        providerName: '',
        itemType: 'Blankets & Clothing',
        quantity: '1',
        details: '',
        lat: '',
        lng: ''
      });
      if (onSupplySubmitted) onSupplySubmitted();
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      console.error(e);
      alert("Could not register supply sharing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ marginTop: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <HeartHandshake className="text-info" size={24} />
        <h2 style={{ fontSize: '1.15rem' }}>Share Surplus Supplies</h2>
      </div>

      <p className="text-secondary" style={{ fontSize: '0.8rem', marginBottom: '15px' }}>
        Do you have spare blankets, food, water filters, or trucks? Share them to assist rescue operations.
      </p>

      {success && (
        <div style={{ color: 'var(--success)', fontSize: '0.8rem', background: 'rgba(29, 209, 161, 0.08)', border: '1px solid rgba(29, 209, 161, 0.25)', borderRadius: '6px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Check size={14} /> Shared supplies pinned on map. Thank you!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Gordon Cole"
              value={formData.providerName}
              onChange={e => setFormData({...formData, providerName: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input 
              type="number" 
              className="form-control" 
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: e.target.value})}
              min="1"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Supply Category</label>
          <select 
            className="form-control"
            value={formData.itemType}
            onChange={e => setFormData({...formData, itemType: e.target.value})}
          >
            <option value="Blankets & Clothing">Blankets & Clothing</option>
            <option value="Dry Food Rations">Dry Food Rations</option>
            <option value="Drinking Water">Drinking Water</option>
            <option value="Medical / First Aid Kits">Medical / First Aid Kits</option>
            <option value="Logistics (Trucks/SUVs)">Logistics (Trucks/SUVs)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Details / Hand-off method</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. Woolen blankets, can hand off at Civic Center"
            value={formData.details}
            onChange={e => setFormData({...formData, details: e.target.value})}
          />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Supply Location</span>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ padding: '3px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}
              onClick={captureLocation}
              disabled={isLocating}
            >
              <MapPin size={10} /> {isLocating ? 'Locating...' : 'Get GPS'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="number" step="any" placeholder="Lat" className="form-control" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} style={{ fontSize: '0.8rem', padding: '6px' }} required />
            <input type="number" step="any" placeholder="Lng" className="form-control" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} style={{ fontSize: '0.8rem', padding: '6px' }} required />
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '10px', background: 'var(--info)' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering...' : 'Register Shared Surplus'}
        </button>
      </form>
    </div>
  );
}
