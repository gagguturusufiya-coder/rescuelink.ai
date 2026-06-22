import React, { useState } from 'react';
import { Search, MapPin, Check, Plus, AlertCircle, ShoppingBag } from 'lucide-react';

export default function ShelterFinder({ 
  shelters = [], 
  onUpdateShelter, 
  userRole, 
  onLocateShelter 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingShelterId, setEditingShelterId] = useState(null);
  const [editForm, setEditForm] = useState({
    occupancy: 0,
    food: 'High',
    water: 'High',
    medical: 'None'
  });

  const filteredShelters = shelters.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (shelter) => {
    setEditingShelterId(shelter.id);
    setEditForm({
      occupancy: shelter.occupancy,
      food: shelter.food,
      water: shelter.water,
      medical: shelter.medical
    });
  };

  const handleSave = async (id) => {
    if (onUpdateShelter) {
      await onUpdateShelter(id, editForm);
    }
    setEditingShelterId(null);
  };

  const getSupplyBadgeClass = (status) => {
    if (status === 'High' || status === 'Full Support' || status === 'Basic First Aid') return 'badge-success';
    if (status === 'Medium') return 'badge-medium';
    if (status === 'Low') return 'badge-high';
    return 'badge-critical';
  };

  return (
    <div className="glass-panel" style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🏡 Emergency Shelters
        </h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {filteredShelters.length} active locations
        </span>
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} size={18} />
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search shelters by name..." 
          style={{ paddingLeft: '35px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Shelter List */}
      <div className="card-list">
        {filteredShelters.map((shelter) => {
          const isEditing = editingShelterId === shelter.id;
          const isStaff = userRole === 'volunteer' || userRole === 'admin';
          const fullness = Math.round((shelter.occupancy / shelter.capacity) * 100);
          
          return (
            <div key={shelter.id} className="list-card" style={{ borderLeft: `3px solid ${fullness > 90 ? 'var(--primary)' : 'var(--success)'}` }}>
              {isEditing ? (
                // Editing layout for Admins/Volunteers
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '5px' }}>Edit {shelter.name}</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Current Occupancy</label>
                      <input 
                        type="number" 
                        className="form-control"
                        value={editForm.occupancy}
                        max={shelter.capacity}
                        min="0"
                        onChange={e => setEditForm({...editForm, occupancy: Number(e.target.value)})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Food Supplies</label>
                      <select 
                        className="form-control"
                        value={editForm.food}
                        onChange={e => setEditForm({...editForm, food: e.target.value})}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Water Supplies</label>
                      <select 
                        className="form-control"
                        value={editForm.water}
                        onChange={e => setEditForm({...editForm, water: e.target.value})}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Medical Support</label>
                      <select 
                        className="form-control"
                        value={editForm.medical}
                        onChange={e => setEditForm({...editForm, medical: e.target.value})}
                      >
                        <option value="Full Support">Full Support</option>
                        <option value="Basic First Aid">Basic First Aid</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '5px' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setEditingShelterId(null)}>
                      Cancel
                    </button>
                    <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleSave(shelter.id)}>
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // Read-only layout
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>{shelter.name}</h3>
                      <p className="text-secondary" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={12} /> {shelter.distance}
                      </p>
                    </div>
                    {isStaff && (
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'rgba(29, 209, 161, 0.3)', color: 'var(--success)' }}
                        onClick={() => startEdit(shelter)}
                      >
                        Update
                      </button>
                    )}
                  </div>

                  {/* Capacity Bar */}
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Capacity Profile:</span>
                      <strong style={{ color: fullness > 90 ? 'var(--primary)' : 'var(--success)' }}>
                        {shelter.occupancy} / {shelter.capacity} ({fullness}% Full)
                      </strong>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${Math.min(fullness, 100)}%`, 
                          height: '100%', 
                          background: fullness > 90 ? 'var(--primary)' : 'var(--success)',
                          borderRadius: '3px'
                        }} 
                      />
                    </div>
                  </div>

                  {/* Resource Badges */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                    <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      <span>🍱 Food:</span>
                      <span className={`badge ${getSupplyBadgeClass(shelter.food)}`}>{shelter.food}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      <span>💧 Water:</span>
                      <span className={`badge ${getSupplyBadgeClass(shelter.water)}`}>{shelter.water}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      <span>🩺 Medical:</span>
                      <span className={`badge ${getSupplyBadgeClass(shelter.medical)}`}>{shelter.medical}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem', flexGrow: 1 }}
                      onClick={() => onLocateShelter([shelter.lat, shelter.lng])}
                    >
                      Locate on Map
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
