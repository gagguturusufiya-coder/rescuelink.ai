import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

// Initial seed data
const initialData = {
  emergencies: [
    {
      id: "sos-1",
      userId: "citizen-1",
      name: "Amit Sharma",
      phone: "+91 98765 43210",
      lat: 19.0750,
      lng: 72.8700,
      disasterType: "Flood",
      severity: "High",
      affectedPeople: 3,
      injuries: "One person with minor leg injury",
      status: "Help Assigned", // SOS Sent, Waiting for Rescue, Help Assigned, Completed
      volunteerId: "vol-2",
      createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
      id: "sos-2",
      userId: "citizen-2",
      name: "Rajesh Patel",
      phone: "+91 98234 56789",
      lat: 19.0650,
      lng: 72.8650,
      disasterType: "Fire",
      severity: "Critical",
      affectedPeople: 2,
      injuries: "Inhalation of smoke",
      status: "Waiting for Rescue",
      volunteerId: null,
      createdAt: new Date(Date.now() - 1800000).toISOString() // 30 mins ago
    }
  ],
  shelters: [
    {
      id: "shelter-1",
      name: "Dharavi Town Hall Shelter",
      lat: 19.0400,
      lng: 72.8500,
      distance: "0.8 km",
      capacity: 350,
      occupancy: 240,
      food: "High",
      water: "High",
      medical: "Full Support",
      status: "Active"
    },
    {
      id: "shelter-2",
      name: "Bandra Sports Complex Complex",
      lat: 19.0600,
      lng: 72.8300,
      distance: "2.5 km",
      capacity: 500,
      occupancy: 120,
      food: "Medium",
      water: "High",
      medical: "Basic First Aid",
      status: "Active"
    },
    {
      id: "shelter-3",
      name: "Dadar Temple Community Hall",
      lat: 19.0200,
      lng: 72.8400,
      distance: "4.1 km",
      capacity: 150,
      occupancy: 145,
      food: "Low",
      water: "Low",
      medical: "None",
      status: "Full"
    },
    {
      id: "shelter-4",
      name: "Kurla Station Relief Camp",
      lat: 19.0720,
      lng: 72.8800,
      distance: "0.5 km",
      capacity: 200,
      occupancy: 35,
      food: "High",
      water: "High",
      medical: "Basic First Aid",
      status: "Active"
    }
  ],
  volunteers: [
    {
      id: "vol-1",
      name: "Vikram Singh",
      email: "vikram@rescuelink.org.in",
      phone: "+91 99112 23344",
      status: "Available", // Available, On Mission, Offline
      currentTaskId: null,
      skills: ["First Aid", "Water Rescue"]
    },
    {
      id: "vol-2",
      name: "Priya Nair",
      email: "priya@rescuelink.org.in",
      phone: "+91 99223 34455",
      status: "On Mission",
      currentTaskId: "sos-1",
      skills: ["Medical Emergency", "Psychological Support"]
    },
    {
      id: "vol-3",
      name: "Arjun Rao",
      email: "arjun@rescuelink.org.in",
      phone: "+91 99334 45566",
      status: "Available",
      currentTaskId: null,
      skills: ["Search & Rescue", "Truck Driver"]
    }
  ],
  reports: [
    {
      id: "report-1",
      title: "Kurla Mithi River Overflowing",
      description: "Severe water logging near Mithi river borders. Water level rising fast, touching 3-4 feet. Traffic fully suspended.",
      category: "Flooded roads",
      severity: "High",
      lat: 19.0720,
      lng: 72.8810,
      photo: null,
      createdAt: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
    },
    {
      id: "report-2",
      title: "Blocked Lane - Fallen Banyan Tree",
      description: "A huge banyan tree has collapsed blocking SV Road, Bandra. Municipal Corporation notified.",
      category: "Fallen trees",
      severity: "Medium",
      lat: 19.0580,
      lng: 72.8320,
      photo: null,
      createdAt: new Date(Date.now() - 14400000).toISOString() // 4 hours ago
    },
    {
      id: "report-3",
      title: "Live Wire Hazard in Water",
      description: "Downed electric line sparking in water logged street near Sion circle. Highly hazardous. Avoid walking.",
      category: "Unsafe areas",
      severity: "Critical",
      lat: 19.0400,
      lng: 72.8600,
      photo: null,
      createdAt: new Date(Date.now() - 300000).toISOString() // 5 mins ago
    }
  ],
  missing_persons: [
    {
      id: "missing-1",
      name: "Ramesh Kumar",
      age: 58,
      lastLocation: "Near Kurla West underpass",
      contactInfo: "Sanjay Kumar (Son): +91 98112 34567",
      description: "Wearing a white kurta-pyjama, black sandals. Carrying a steel tiffin box.",
      photo: null,
      status: "Missing",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "missing-2",
      name: "Ananya Gupta",
      age: 9,
      lastLocation: "Bandra SV Road market complex",
      contactInfo: "Deepak Gupta (Father): +91 98223 45678",
      description: "Red raincoat, carrying a blue school bottle. Brown hair tied with a red band.",
      photo: null,
      status: "Missing",
      createdAt: new Date(Date.now() - 43200000).toISOString()
    }
  ],
  alerts: [
    {
      id: "alert-1",
      title: "IMD Heavy Rainfall Red Alert",
      message: "IMD issues red alert for Mumbai. Extreme heavy rainfall expected in next 24 hours. High tide warning at 2:30 PM. Stay indoors.",
      severity: "Critical",
      category: "Disaster Warning",
      active: true,
      createdAt: new Date(Date.now() - 5400000).toISOString()
    },
    {
      id: "alert-2",
      title: "NDRF Evacuation Notice",
      message: "NDRF advises residents near Mithi River banks to evacuate immediately to Kurla Station Relief Camp or Bandra Sports Complex.",
      severity: "High",
      category: "Evacuation Alert",
      active: true,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ],
  resources: {
    food: 2500, // units/rations
    medicine: 800, // medical kits
    rescueEquipment: 150, // inflatable boats, jackets
    volunteers: 6,
    vehicles: 22
  }
};

// Ensure database directory and file exist
export function initDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log("Database initialized with seed data.");
  }
}

// Read database
export function readDB() {
  try {
    initDB();
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.shared_supplies) {
      parsed.shared_supplies = [
        { id: "supply-1", providerName: "Rakesh Kumar", lat: 19.0750, lng: 72.8770, itemType: "Blankets & Clothing", quantity: 15, details: "Warm woolen blankets and raincoats. Can drop off near Kurla.", status: "Available", createdAt: new Date().toISOString() },
        { id: "supply-2", providerName: "Dr. Sunita Patel", lat: 19.0600, lng: 72.8350, itemType: "Water Purifiers", quantity: 5, details: "First aid kits and water purification tablets. Bandra area.", status: "Available", createdAt: new Date().toISOString() }
      ];
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (error) {
    console.error("Error reading database:", error);
    return initialData;
  }
}

// Write database
export function writeDB(data) {
  try {
    initDB();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error("Error writing database:", error);
    return false;
  }
}

// Collection Helpers
export const db = {
  getCollection: (name) => {
    const data = readDB();
    return data[name] || [];
  },
  
  saveCollection: (name, items) => {
    const data = readDB();
    data[name] = items;
    return writeDB(data);
  },
  
  find: (collectionName, query = {}) => {
    const items = db.getCollection(collectionName);
    return items.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },
  
  findOne: (collectionName, query = {}) => {
    const items = db.getCollection(collectionName);
    return items.find(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  },
  
  insert: (collectionName, item) => {
    const items = db.getCollection(collectionName);
    const newItem = {
      id: `${collectionName.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      ...item
    };
    items.unshift(newItem); // Put newer items first
    db.saveCollection(collectionName, items);
    return newItem;
  },
  
  update: (collectionName, id, updates) => {
    const items = db.getCollection(collectionName);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    db.saveCollection(collectionName, items);
    return items[index];
  },
  
  delete: (collectionName, id) => {
    const items = db.getCollection(collectionName);
    const filtered = items.filter(item => item.id !== id);
    if (items.length === filtered.length) return false;
    db.saveCollection(collectionName, filtered);
    return true;
  },

  // Special object properties helper
  getGlobalResources: () => {
    const data = readDB();
    return data.resources || initialData.resources;
  },

  updateGlobalResources: (updates) => {
    const data = readDB();
    data.resources = { ...data.resources, ...updates };
    writeDB(data);
    return data.resources;
  }
};
