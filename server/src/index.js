import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db.js';
import { askGemini } from './services/gemini.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow Base64 images in reports

// Log request middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 1. AI Chat Assistant Endpoint
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  
  try {
    const reply = await askGemini(message, history || []);
    res.json({ response: reply });
  } catch (error) {
    res.status(500).json({ error: "Failed to process chat response" });
  }
});

// 2. SOS Emergency Endpoints
app.get('/api/emergencies', (req, res) => {
  const emergencies = db.getCollection('emergencies');
  res.json(emergencies);
});

app.post('/api/emergencies/sos', (req, res) => {
  const { name, phone, lat, lng, disasterType, severity, affectedPeople, injuries } = req.body;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: "Location coordinates (lat, lng) are required." });
  }
  
  // Find an available volunteer nearby to assign
  const volunteers = db.getCollection('volunteers');
  const availableVolunteer = volunteers.find(v => v.status === 'Available');
  
  const sosItem = {
    name: name || "Anonymous Citizen",
    phone: phone || "Not Provided",
    lat,
    lng,
    disasterType: disasterType || "Unknown",
    severity: severity || "Critical",
    affectedPeople: Number(affectedPeople) || 1,
    injuries: injuries || "None reported",
    status: availableVolunteer ? "Help Assigned" : "Waiting for Rescue",
    volunteerId: availableVolunteer ? availableVolunteer.id : null
  };
  
  const createdSos = db.insert('emergencies', sosItem);
  
  // If a volunteer was assigned, update their status
  if (availableVolunteer) {
    db.update('volunteers', availableVolunteer.id, {
      status: 'On Mission',
      currentTaskId: createdSos.id
    });
  }
  
  res.status(201).json(createdSos);
});

app.put('/api/emergencies/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, volunteerId } = req.body; // status: SOS Sent, Waiting for Rescue, Help Assigned, Completed
  
  const currentEmergency = db.findOne('emergencies', { id });
  if (!currentEmergency) {
    return res.status(404).json({ error: "Emergency incident not found" });
  }
  
  const updates = { status };
  if (volunteerId !== undefined) {
    updates.volunteerId = volunteerId;
  }
  
  const updatedEmergency = db.update('emergencies', id, updates);
  
  // Update volunteers accordingly
  if (status === 'Completed' && currentEmergency.volunteerId) {
    db.update('volunteers', currentEmergency.volunteerId, {
      status: 'Available',
      currentTaskId: null
    });
  } else if (volunteerId && status === 'Help Assigned') {
    db.update('volunteers', volunteerId, {
      status: 'On Mission',
      currentTaskId: id
    });
  }
  
  res.json(updatedEmergency);
});

// 3. Shelter Endpoints
app.get('/api/shelters', (req, res) => {
  const shelters = db.getCollection('shelters');
  res.json(shelters);
});

app.put('/api/shelters/:id', (req, res) => {
  const { id } = req.params;
  const { occupancy, food, water, medical, status } = req.body;
  
  const updates = {};
  if (occupancy !== undefined) updates.occupancy = Number(occupancy);
  if (food !== undefined) updates.food = food;
  if (water !== undefined) updates.water = water;
  if (medical !== undefined) updates.medical = medical;
  if (status !== undefined) updates.status = status;
  
  const updatedShelter = db.update('shelters', id, updates);
  if (!updatedShelter) {
    return res.status(404).json({ error: "Shelter not found" });
  }
  
  res.json(updatedShelter);
});

// 4. Community Reports Endpoints
app.get('/api/reports', (req, res) => {
  const reports = db.getCollection('reports');
  res.json(reports);
});

app.post('/api/reports', (req, res) => {
  const { title, description, category, severity, lat, lng, photo } = req.body;
  
  if (!title || !category || !lat || !lng) {
    return res.status(400).json({ error: "Missing required report fields" });
  }
  
  const newReport = db.insert('reports', {
    title,
    description: description || "",
    category,
    severity: severity || "Medium",
    lat: Number(lat),
    lng: Number(lng),
    photo: photo || null
  });
  
  res.status(201).json(newReport);
});

// 5. Volunteer Network Endpoints
app.get('/api/volunteers', (req, res) => {
  const volunteers = db.getCollection('volunteers');
  res.json(volunteers);
});

app.post('/api/volunteers/register', (req, res) => {
  const { name, email, phone, skills } = req.body;
  
  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Name, email, and phone are required for registration." });
  }
  
  // Check if email already registered
  const exists = db.findOne('volunteers', { email });
  if (exists) {
    return res.status(400).json({ error: "Volunteer with this email already registered." });
  }
  
  const newVol = db.insert('volunteers', {
    name,
    email,
    phone,
    status: "Available",
    currentTaskId: null,
    skills: skills || []
  });
  
  res.status(201).json(newVol);
});

app.put('/api/volunteers/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, currentTaskId } = req.body; // Available, On Mission, Offline
  
  const updates = {};
  if (status) updates.status = status;
  if (currentTaskId !== undefined) updates.currentTaskId = currentTaskId;
  
  const updatedVol = db.update('volunteers', id, updates);
  if (!updatedVol) {
    return res.status(404).json({ error: "Volunteer not found" });
  }
  
  res.json(updatedVol);
});

// 6. Missing Persons Endpoints
app.get('/api/missing-persons', (req, res) => {
  const persons = db.getCollection('missing_persons');
  res.json(persons);
});

app.post('/api/missing-persons', (req, res) => {
  const { name, age, lastLocation, contactInfo, description, photo } = req.body;
  
  if (!name || !lastLocation || !contactInfo) {
    return res.status(400).json({ error: "Name, last location, and contact information are required." });
  }
  
  const newPerson = db.insert('missing_persons', {
    name,
    age: Number(age) || null,
    lastLocation,
    contactInfo,
    description: description || "",
    photo: photo || null,
    status: "Missing"
  });
  
  res.status(201).json(newPerson);
});

// 7. Active Alerts Endpoints
app.get('/api/alerts', (req, res) => {
  const alerts = db.getCollection('alerts');
  res.json(alerts.filter(a => a.active !== false));
});

app.post('/api/alerts', (req, res) => {
  const { title, message, severity, category } = req.body;
  
  if (!title || !message || !severity) {
    return res.status(400).json({ error: "Missing alert parameters" });
  }
  
  const newAlert = db.insert('alerts', {
    title,
    message,
    severity, // Low, Medium, High, Critical
    category: category || "Disaster Warning",
    active: true
  });
  
  res.status(201).json(newAlert);
});

// 8. Analytics Data Endpoint
app.get('/api/analytics', (req, res) => {
  const emergencies = db.getCollection('emergencies');
  const shelters = db.getCollection('shelters');
  const reports = db.getCollection('reports');
  const volunteers = db.getCollection('volunteers');
  const resources = db.getGlobalResources();
  
  // Incident density per disaster type
  const disasterCounts = {};
  emergencies.forEach(e => {
    disasterCounts[e.disasterType] = (disasterCounts[e.disasterType] || 0) + 1;
  });
  
  // Rescue rates
  const completedRescues = emergencies.filter(e => e.status === 'Completed').length;
  const activeRescues = emergencies.filter(e => e.status !== 'Completed').length;
  
  // Shelter usage
  let totalCapacity = 0;
  let totalOccupancy = 0;
  shelters.forEach(s => {
    totalCapacity += s.capacity;
    totalOccupancy += s.occupancy;
  });
  
  res.json({
    totalEmergencies: emergencies.length,
    activeRescues,
    completedRescues,
    shelterStats: {
      totalCapacity,
      totalOccupancy,
      occupancyPercentage: totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0
    },
    disasterBreakdown: disasterCounts,
    reportsCount: reports.length,
    volunteersCount: volunteers.length,
    activeVolunteers: volunteers.filter(v => v.status === 'On Mission').length,
    resources
  });
});

// 9. Community Shared Supplies Endpoints
app.get('/api/shared-supplies', (req, res) => {
  const supplies = db.getCollection('shared_supplies');
  res.json(supplies);
});

app.post('/api/shared-supplies', (req, res) => {
  const { providerName, lat, lng, itemType, quantity, details } = req.body;
  if (!providerName || !lat || !lng || !itemType || !quantity) {
    return res.status(400).json({ error: "Missing required supply fields" });
  }
  const newSupply = db.insert('shared_supplies', {
    providerName,
    lat: Number(lat),
    lng: Number(lng),
    itemType,
    quantity: Number(quantity),
    details: details || "",
    status: "Available"
  });
  res.status(201).json(newSupply);
});

app.put('/api/shared-supplies/:id/claim', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Available, Claimed
  
  const updated = db.update('shared_supplies', id, { status });
  if (!updated) {
    return res.status(404).json({ error: "Shared supply listing not found" });
  }
  res.json(updated);
});

// 10. Disaster Simulation Trigger (Admin only demo route)
app.post('/api/admin/simulate-disaster', (req, res) => {
  const { disasterType, lat, lng, areaName } = req.body;
  if (!disasterType || !lat || !lng) {
    return res.status(400).json({ error: "Missing disaster type or coordinates" });
  }
  
  // 1. Broadcast evacuation warning alert
  const alert = db.insert('alerts', {
    title: `SIMULATED EMERGENCY: Active ${disasterType}`,
    message: `A simulated ${disasterType.toLowerCase()} event has been triggered in the ${areaName || 'vicinity'} area. Local shelters are on active standby. Residents remain indoors.`,
    severity: "Critical",
    category: "Disaster Warning",
    active: true
  });
  
  // 2. Create emergency mock incident
  const emergency = db.insert('emergencies', {
    name: `Simulated Incident (${disasterType})`,
    phone: "SIM-911",
    lat: Number(lat),
    lng: Number(lng),
    disasterType,
    severity: "High",
    affectedPeople: Math.floor(Math.random() * 5) + 1,
    injuries: "Minor panic, structurally isolated",
    status: "Waiting for Rescue",
    volunteerId: null
  });
  
  res.json({ alert, emergency });
});

// Start Server
app.listen(PORT, () => {
  console.log(`RescueLink Server running on http://localhost:${PORT}`);
});
