import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || '';

// System prompt instructing the model to behave as an emergency agent
const SYSTEM_PROMPT = `You are RescueLink AI, an emergency response and disaster support agent.
Your primary role is to assist people in high-stress, dangerous situations (floods, earthquakes, cyclones, fires, accidents, landslides).

Follow these rules strictly:
1. Be calm, reassuring, and highly structured in your response.
2. Use bullet points and bold text for crucial instructions.
3. If the user indicates an immediate danger, ask them to provide their current location, number of people with them, and any urgent medical needs.
4. Keep responses concise and focused on safety first. Long paragraphs are hard to read during an emergency.
5. Provide actionable steps for the specific disaster type.
6. Support multi-lingual responses if the user greets you in Spanish ("Hola"), Hindi ("नमस्ते" / "Help"), or other languages.

If appropriate, remind them to press the red SOS button to share their live coordinates with emergency dispatchers.`;

export async function askGemini(message, history = []) {
  if (API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
      
      // Structure the contents array for the Gemini API
      const contents = [];
      
      // Add history if any
      history.forEach(h => {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        });
      });
      
      // Add current message with system instructions
      contents.push({
        role: 'user',
        parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Message: ${message}` }]
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.2
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const responseData = await response.json();
      const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        return text;
      }
    } catch (e) {
      console.warn("Failed to contact Gemini API, using rule-based responder:", e.message);
    }
  }

  // Fallback Rule-Based Expert System
  return getFallbackResponse(message);
}

function getFallbackResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('flood') || msg.includes('water') || msg.includes('drown') || msg.includes('stuck in water')) {
    return `### 🚨 Flood Safety Protocol Activated

I understand you are facing a flood emergency. Please read and follow these steps immediately:

1. **Move to Higher Ground**: Immediately head to the highest floor of your building or climb to high ground. **Do not stay in basements.**
2. **Avoid Moving Water**: Do not attempt to walk, swim, or drive through flood waters. Just 6 inches of moving water can knock you down, and 2 feet can sweep cars away.
3. **Avoid Electricity**: Stay away from electric poles, fallen wires, and electrical appliances. If your building is flooding, turn off the main power if safe to do so.
4. **Prepare SOS**: Click the **SOS Emergency Button** in the RescueLink interface to share your precise coordinates with our rescue teams.
5. **Wait for Help**: Do not try to cross floodwaters unless guided by professionals. Keep your phone on battery saver mode.

**Recommended Shelter**: [Dharavi Town Hall Shelter] (0.8 km away - Food & Water available).
**Emergency Contacts**:
- National Emergency Helpline: **112**
- NDRF Disaster Management: **1078** / **108**
- Ambulance Service: **102** / **108**`;
  }
  
  if (msg.includes('earthquake') || msg.includes('shake') || msg.includes('tremor')) {
    return `### 🚨 Earthquake Safety Protocol Activated

Earthquake detected or reported. Follow these immediate survival guidelines:

1. **Drop, Cover, and Hold On**:
   - **Drop** to your hands and knees.
   - **Cover** your head and neck under a sturdy table or desk.
   - **Hold on** to your shelter until shaking stops.
2. **Stay Indoors if Inside**: Do not run outside during the shaking. Most injuries occur when people try to enter or leave buildings.
3. **Move Away from Hazards**: Stay clear of glass windows, mirrors, bookshelves, and heavy hanging light fixtures.
4. **If Outside**: Move to an open area away from buildings, streetlights, and utility wires.
5. **Check for Aftershocks**: Be prepared for smaller tremors following the main event.

**Recommended Shelter**: [Bandra Sports Complex Complex] (2.5 km away - Large open safety perimeter).
**Emergency Contacts**:
- NDRF Control Room: **112** / **1078**
- Fire Department: **101**`;
  }
  
  if (msg.includes('cyclone') || msg.includes('hurricane') || msg.includes('storm') || msg.includes('wind')) {
    return `### 🚨 Cyclone / Severe Storm Protocol Activated

A cyclone or high-speed storm is threatening your area. Follow these emergency steps:

1. **Stay Indoors**: Remain inside a secure room, preferably windowless (like a bathroom or corridor).
2. **Secure Doors & Windows**: Shut all windows and doors firmly. Keep storm boards or thick curtains drawn to block shattered glass.
3. **Disconnect Utilities**: Turn off gas valves and disconnect electrical appliances to prevent fire hazards.
4. **Prepare Emergency Kit**: Gather drinking water, dry food, flashlights, power banks, and necessary medicines.
5. **Stay Tuned**: Keep monitoring our **Alerts Section** for live meteorological updates.

**Recommended Shelter**: [Dharavi Town Hall Shelter] (0.8 km away).
**Emergency Contacts**:
- Cyclone Helpline: **1078**
- NDRF Control: **112**`;
  }

  if (msg.includes('fire') || msg.includes('smoke') || msg.includes('burn')) {
    return `### 🚨 Fire Safety Protocol Activated

Fire or heavy smoke detected. Please take immediate action:

1. **Evacuate Immediately**: Get out of the building. Do not stop to collect personal belongings.
2. **Stay Low to the Ground**: If there is smoke, crawl on your hands and knees to stay below the toxic gases.
3. **Check Doors with Back of Hand**: Before opening any door, touch it with the back of your hand. If it is hot, do not open it; find an alternative exit.
4. **Do Not Use Elevators**: Always use the stairs.
5. **If Trapped**: Close the door, seal cracks around the door with wet clothes/towels, and signal for help through a window if possible.

**Emergency Contacts**:
- Fire Brigade: **101** / **112**
- Ambulance Service: **102** / **108**`;
  }

  if (msg.includes('accident') || msg.includes('crash') || msg.includes('collision')) {
    return `### 🚨 Accident & First Aid Response Activated

Emergency accident reported. Follow these steps:

1. **Secure the Scene**: Ensure it is safe for you to help. Put on hazard lights if driving.
2. **Do Not Move Injured Persons**: Unless there is an immediate danger (like a fire or explosion risk), do not move casualties as it can worsen spinal injuries.
3. **Apply Direct Pressure**: If there is severe bleeding, apply firm, continuous pressure with a clean cloth.
4. **Check Responsiveness**: Talk to the victim. If unresponsive but breathing, place them in the recovery position (on their side).
5. **Call Emergency Services**: Convey exact location and number of victims.

**Emergency Contacts**:
- Highway Rescue: **1033**
- Ambulance: **112** / **102**`;
  }

  if (msg.includes('landslide') || msg.includes('mudslide') || msg.includes('rockfall')) {
    return `### 🚨 Landslide Safety Protocol Activated

Landslide danger detected. Take immediate precautions:

1. **Move Away from Slope**: Walk away from the slide area. Do not attempt to cross debris.
2. **Listen for Anomalies**: Pay attention to unusual sounds (trees cracking, boulders knocking together) that indicate moving earth.
3. **If Inside**: Move to the upper floor, or curl into a tight ball under a sturdy piece of furniture if trapped.
4. **Avoid River Channels**: Mudflows can travel down rivers and stream channels rapidly.

**Recommended Shelter**: [Bandra Sports Complex Complex] (2.5 km away).
**Emergency Contacts**:
- Disaster Response Force (NDRF): **1078** / **112**`;
  }

  // Generic reassuring response asking for details
  return `### Namaste. I am RescueLink AI, your Disaster Support Agent.

Please tell me:
1. **What is your current emergency**? (e.g., Flood, Fire, Earthquake, Accident)
2. **Where are you located**? (Provide landmarks or cross-streets)
3. **Are there any injuries**?
4. **How many people are with you**?

*Tip: If you need immediate assistance, click the red **SOS Button** to broadcast your coordinates to nearby volunteers and rescue squads.*`;
}
