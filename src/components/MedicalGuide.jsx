import React, { useState } from 'react';
import { HeartPulse, Phone, AlertCircle, Cross, Check } from 'lucide-react';

const FIRST_AID_GUIDES = [
  {
    id: "fa-cpr",
    title: "Cardiopulmonary Resuscitation (CPR)",
    description: "For unresponsive individuals who are not breathing normally.",
    steps: [
      "Check responsiveness: Shake shoulders, shout 'Are you okay?'.",
      "Call emergency services immediately (112 / 108).",
      "Start chest compressions: Push hard and fast in the center of the chest (100-120 compressions per minute).",
      "Open airway & give rescue breaths (if trained): Tilt head, lift chin, pinch nose, give 2 breaths after every 30 compressions.",
      "Repeat compressions and breaths until professional help arrives or an AED is ready."
    ]
  },
  {
    id: "fa-bleed",
    title: "Severe Bleeding Control",
    description: "How to stop rapid blood loss from open wounds.",
    steps: [
      "Apply direct pressure: Use a clean cloth, sterile bandage, or your gloved hand. Push firmly directly on the wound.",
      "Elevate: If possible, raise the bleeding limb above heart level while applying pressure.",
      "Keep patient warm: Cover with blankets to prevent shock.",
      "Add layers: If blood seeps through, do not remove the cloth. Add more cloths on top and continue pressing.",
      "Tourniquet (Last resort): Apply 2 inches above the wound for severe, uncontrollable limb bleeding."
    ]
  },
  {
    id: "fa-choke",
    title: "Choking (Heimlich Maneuver)",
    description: "For individuals whose airway is blocked by a foreign object.",
    steps: [
      "Stand behind the person, wrap your arms around their waist.",
      "Make a fist with one hand and place it slightly above the navel.",
      "Grasp your fist with your other hand.",
      "Perform quick, upward, and inward thrusts.",
      "Continue until the object is expelled or the person becomes unresponsive (if unresponsive, begin CPR)."
    ]
  },
  {
    id: "fa-burn",
    title: "Burns & Heat Exposure",
    description: "Treatment for thermal burns and scalds.",
    steps: [
      "Cool the burn: Run cool (not cold) water over the burn for 10-20 minutes. Do not use ice.",
      "Remove jewelry: Take off rings or tight clothing from the burned area before swelling starts.",
      "Cover loosely: Apply a sterile, non-adhesive bandage or clean plastic wrap.",
      "Do not pop blisters: Popping blisters increases risk of infection.",
      "Seek medical help: If the burn is larger than a palm, on face/hands, or turns white/charred."
    ]
  }
];

export default function MedicalGuide() {
  const [selectedGuideId, setSelectedGuideId] = useState(FIRST_AID_GUIDES[0].id);
  const [triageLevel, setTriageLevel] = useState('Normal');

  const activeGuide = FIRST_AID_GUIDES.find(g => g.id === selectedGuideId);

  const getTriageColor = () => {
    if (triageLevel === 'Critical') return '#ff4b5c';
    if (triageLevel === 'Urgent') return '#ff9f43';
    return '#1dd1a1';
  };

  return (
    <div className="glass-panel" style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <HeartPulse className="text-primary" size={24} />
        <h2 style={{ fontSize: '1.25rem' }}>Medical Emergency Assistant</h2>
      </div>

      {/* Emergency dispatch banner */}
      <div style={{ 
        background: 'rgba(255, 75, 92, 0.08)',
        border: '1px solid rgba(255, 75, 92, 0.2)',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: '700' }}>Ambulance Dispatch</h3>
          <p className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
            Immediate medical transport lines
          </p>
        </div>
        <a 
          href="tel:112" 
          className="btn btn-primary"
          style={{ padding: '8px 16px', background: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
        >
          <Phone size={16} /> Call 112 / 108 / 102
        </a>
      </div>

      {/* Triage Selector */}
      <div style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Medical Triage Classifier:</span>
          <span 
            className="badge" 
            style={{ 
              backgroundColor: `${getTriageColor()}22`, 
              color: getTriageColor(),
              border: `1px solid ${getTriageColor()}44`
            }}
          >
            {triageLevel} Priority
          </span>
        </div>
        <select 
          className="form-control"
          value={triageLevel}
          onChange={(e) => setTriageLevel(e.target.value)}
        >
          <option value="Normal">Normal: Minor cuts, localized burns, stable vitals</option>
          <option value="Urgent">Urgent: Fractures, deep laceration, moderate burns, breathing issues</option>
          <option value="Critical">Critical: Unresponsive, heavy bleeding, chest pain, stroke symptoms</option>
        </select>
        <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} /> Critical classifications bypass volunteer dispatch and go directly to emergency services.
        </p>
      </div>

      {/* First Aid Guides */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: 'var(--text-primary)' }}>First Aid Instructions</h3>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
          {FIRST_AID_GUIDES.map(guide => (
            <button
              key={guide.id}
              className="quick-action-btn"
              onClick={() => setSelectedGuideId(guide.id)}
              style={{
                borderColor: selectedGuideId === guide.id ? 'var(--primary)' : 'var(--border-color)',
                color: selectedGuideId === guide.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: selectedGuideId === guide.id ? 'rgba(255, 75, 92, 0.05)' : 'transparent',
                whiteSpace: 'nowrap'
              }}
            >
              {guide.title.split(' (')[0]} {/* Shorten tab title */}
            </button>
          ))}
        </div>

        {activeGuide && (
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '15px' }}>
            <h4 style={{ color: 'var(--primary)', fontSize: '0.95rem', marginBottom: '4px' }}>{activeGuide.title}</h4>
            <p className="text-secondary" style={{ fontSize: '0.8rem', marginBottom: '12px' }}>{activeGuide.description}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeGuide.steps.map((step, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                  <div style={{ 
                    background: 'rgba(255, 75, 92, 0.1)', 
                    color: 'var(--primary)', 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>{step}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
