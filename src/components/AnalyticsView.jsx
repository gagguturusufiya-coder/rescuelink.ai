import React from 'react';
import { BarChart3, Activity, Users2, ShieldAlert, Package, CheckSquare } from 'lucide-react';

export default function AnalyticsView({ analyticsData = null }) {
  if (!analyticsData) {
    return (
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div className="text-secondary">Loading system analytics...</div>
      </div>
    );
  }

  const {
    totalEmergencies,
    activeRescues,
    completedRescues,
    shelterStats = { totalCapacity: 0, totalOccupancy: 0, occupancyPercentage: 0 },
    disasterBreakdown = {},
    reportsCount,
    volunteersCount,
    activeVolunteers,
    resources = { food: 0, medicine: 0, rescueEquipment: 0, volunteers: 0, vehicles: 0 }
  } = analyticsData;

  // Simple SVG helper for Bar Chart
  const renderBreakdownChart = () => {
    const categories = Object.keys(disasterBreakdown);
    const values = Object.values(disasterBreakdown);
    if (categories.length === 0) {
      return <div className="text-muted" style={{ padding: '20px', fontSize: '0.85rem' }}>No incident data recorded yet.</div>;
    }
    const maxVal = Math.max(...values, 1);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
        {categories.map((cat, i) => {
          const val = disasterBreakdown[cat];
          const pct = Math.round((val / maxVal) * 100);
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 30px', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{cat}</div>
              <div style={{ height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <div 
                  style={{ 
                    width: `${pct}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, var(--primary), var(--warning))',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease-out'
                  }} 
                />
              </div>
              <div style={{ textAlign: 'right', fontWeight: '700' }}>{val}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <BarChart3 className="text-primary" size={24} />
        <h2 style={{ fontSize: '1.25rem' }}>AI Disaster Response Analytics</h2>
      </div>

      {/* Grid of counter cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ background: 'rgba(255, 75, 92, 0.03)', border: '1px solid rgba(255, 75, 92, 0.15)', borderRadius: '10px', padding: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>SOS REQUESTS</span>
            <ShieldAlert size={16} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '5px' }}>{totalEmergencies}</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{activeRescues} active rescues</span>
        </div>

        <div style={{ background: 'rgba(29, 209, 161, 0.03)', border: '1px solid rgba(29, 209, 161, 0.15)', borderRadius: '10px', padding: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>RESCUED</span>
            <CheckSquare size={16} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '5px' }}>{completedRescues}</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Rescue rate: {totalEmergencies > 0 ? Math.round((completedRescues/totalEmergencies)*100) : 0}%</span>
        </div>

        <div style={{ background: 'rgba(46, 134, 222, 0.03)', border: '1px solid rgba(46, 134, 222, 0.15)', borderRadius: '10px', padding: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--info)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>SHELTERS</span>
            <Users2 size={16} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '5px' }}>{shelterStats.occupancyPercentage}%</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{shelterStats.totalOccupancy} occupants</span>
        </div>

        <div style={{ background: 'rgba(255, 159, 67, 0.03)', border: '1px solid rgba(255, 159, 67, 0.15)', borderRadius: '10px', padding: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--warning)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>VOLUNTEERS</span>
            <Activity size={16} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '5px' }}>{volunteersCount}</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{activeVolunteers} on active mission</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Disaster Breakdown Chart */}
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '15px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '15px', color: 'var(--text-primary)' }}>Incident Types</h3>
          {renderBreakdownChart()}
        </div>

        {/* Global Supplies Tracker */}
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '15px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={16} className="text-info" />
            Central Depot Resources
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Food Supplies:</span>
                <strong>{resources.food} units</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(resources.food / 15, 100)}%`, height: '100%', background: 'var(--info)', borderRadius: '3px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Medical Kits:</span>
                <strong>{resources.medicine} units</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(resources.medicine / 5, 100)}%`, height: '100%', background: 'var(--info)', borderRadius: '3px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Rescue Gear (Boats, Jackets):</span>
                <strong>{resources.rescueEquipment} units</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(resources.rescueEquipment * 1.3, 100)}%`, height: '100%', background: 'var(--info)', borderRadius: '3px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Emergency Vehicles:</span>
                <strong>{resources.vehicles} units</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(resources.vehicles * 8, 100)}%`, height: '100%', background: 'var(--info)', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
