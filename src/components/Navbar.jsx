import React from 'react';
import { ShieldAlert, MapPin, HeartPulse, FileText, Users, Settings, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, userRole, setUserRole }) {
  const getRoleColor = () => {
    if (userRole === 'admin') return '#ff4b5c';
    if (userRole === 'volunteer') return '#1dd1a1';
    return '#2e86de';
  };

  return (
    <nav className="navbar">
      <div className="nav-logo" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
        <ShieldAlert size={28} />
        <span>RescueLink AI</span>
      </div>

      <div className="nav-links">
        <button 
          className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <ShieldAlert size={16} /> Home
        </button>
        
        <button 
          className={`nav-link ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <MapPin size={16} /> Emergency Map
        </button>
        
        <button 
          className={`nav-link ${activeTab === 'shelters' ? 'active' : ''}`}
          onClick={() => setActiveTab('shelters')}
        >
          <Users size={16} /> Shelters
        </button>
        
        <button 
          className={`nav-link ${activeTab === 'medical' ? 'active' : ''}`}
          onClick={() => setActiveTab('medical')}
        >
          <HeartPulse size={16} /> Medical Help
        </button>
        
        <button 
          className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FileText size={16} /> Reports
        </button>

        {userRole === 'volunteer' && (
          <button 
            className={`nav-link ${activeTab === 'volunteer-hub' ? 'active' : ''}`}
            onClick={() => setActiveTab('volunteer-hub')}
            style={{ color: '#1dd1a1' }}
          >
            <Users size={16} /> Volunteer Hub
          </button>
        )}

        {userRole === 'admin' && (
          <button 
            className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
            style={{ color: '#ff4b5c' }}
          >
            <Settings size={16} /> Admin Console
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <User size={16} className="text-secondary" />
          <select 
            value={userRole} 
            onChange={(e) => {
              const role = e.target.value;
              setUserRole(role);
              // Auto switch active tab to match the specialized views
              if (role === 'admin') {
                setActiveTab('admin');
              } else if (role === 'volunteer') {
                setActiveTab('volunteer-hub');
              } else {
                setActiveTab('home');
              }
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              border: '1px solid var(--border-color)',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              outline: 'none'
            }}
          >
            <option value="citizen" style={{ background: '#14141e' }}>Citizen</option>
            <option value="volunteer" style={{ background: '#14141e' }}>Volunteer</option>
            <option value="admin" style={{ background: '#14141e' }}>Admin</option>
          </select>
        </div>
        
        <span 
          className="nav-role-badge" 
          style={{ 
            backgroundColor: `${getRoleColor()}22`, 
            color: getRoleColor(),
            border: `1px solid ${getRoleColor()}44`
          }}
        >
          {userRole}
        </span>
      </div>
    </nav>
  );
}
