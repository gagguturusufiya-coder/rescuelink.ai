import React, { useState } from 'react';
import { Search, UserCheck, AlertCircle, Camera, HeartHandshake } from 'lucide-react';

export default function MissingPersons({ backendUrl, missingPersons = [], onPersonReported }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    lastLocation: '',
    contactInfo: '',
    description: ''
  });
  const [photo, setPhoto] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formData,
      age: formData.age ? Number(formData.age) : null,
      photo
    };

    try {
      const res = await fetch(`${backendUrl}/api/missing-persons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to post report");
      const data = await res.json();
      
      if (onPersonReported) {
        onPersonReported(data);
      }

      setFormData({
        name: '',
        age: '',
        lastLocation: '',
        contactInfo: '',
        description: ''
      });
      setPhoto(null);
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to submit report. Please check server status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search matching: highlights files if keywords in search match name or description
  const filteredPersons = missingPersons.filter(p => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.lastLocation.toLowerCase().includes(term)
    );
  });

  return (
    <div className="glass-panel" style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          👥 Missing Person Assistance
        </h2>
        <button 
          className="btn btn-primary"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Report Missing'}
        </button>
      </div>

      {showAddForm ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>File Missing Person Report</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g. Robert Smith"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input 
                type="number" 
                className="form-control"
                placeholder="e.g. 45"
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Last Known Location</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. Near Broadway Subway intersection"
              value={formData.lastLocation}
              onChange={e => setFormData({...formData, lastLocation: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reporter Contact Info</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. Sarah Smith (Daughter): +1 555-0144"
              value={formData.contactInfo}
              onChange={e => setFormData({...formData, contactInfo: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Clothing, distinguishing features)</label>
            <textarea 
              className="form-control"
              rows="3"
              placeholder="e.g. Wearing a blue hoodie, dark grey cap, glasses. Carrying a brown leather wallet..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Attach Photo (Optional)</label>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <label style={{ 
                background: 'rgba(255,255,255,0.04)', 
                border: '1px dashed var(--border-color)', 
                borderRadius: '8px', 
                padding: '12px', 
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Camera size={18} className="text-secondary" />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Choose Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
              
              {photo && (
                <img src={photo} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ padding: '10px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering report...' : 'Publish Report'}
          </button>
        </form>
      ) : null}

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} size={18} />
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search by name, clothing, location..." 
          style={{ paddingLeft: '35px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Directory list */}
      <div className="card-list">
        {filteredPersons.map(person => (
          <div key={person.id} className="list-card" style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '8px', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--border-color)', 
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {person.photo ? (
                <img src={person.photo} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <AlertCircle size={28} className="text-muted" />
              )}
            </div>

            <div style={{ flexGrow: 1, fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1rem', color: '#fff' }}>{person.name}</h3>
                <span className={`badge ${person.status === 'Found' ? 'badge-success' : 'badge-critical'}`}>
                  {person.status}
                </span>
              </div>
              
              <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                {person.age && <span><strong>Age:</strong> {person.age} | </span>}
                <span><strong>Last Location:</strong> {person.lastLocation}</span>
              </div>
              
              <p className="text-secondary" style={{ marginTop: '8px', background: 'rgba(255,255,255,0.01)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                {person.description}
              </p>

              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <HeartHandshake size={12} className="text-info" />
                <strong>Contact:</strong> {person.contactInfo}
              </div>
            </div>
          </div>
        ))}

        {filteredPersons.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No records match the current search.
          </div>
        )}
      </div>
    </div>
  );
}
