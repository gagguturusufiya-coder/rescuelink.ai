# RescueLink AI: Community Emergency Support Agent

**Track**: Agents for Good  
**Target Region**: Mumbai, Maharashtra, India  

RescueLink AI is a complete, full-stack emergency response and disaster management application designed to assist citizens, coordinate volunteers, and enable administrative supervision during crises (such as flooding, earthquakes, fires, cyclones, and landslides).

---

## 🛠️ System Architecture

RescueLink AI leverages a decoupled client-server architecture built on modern web standards:

```
+--------------------------------------------------------------+
|                    FRONTEND CLIENT (React)                   |
|  - Leaflet.js Mapping  - TTS Voice Alerts  - SOS Beacon      |
|  - Offline Caching     - Custom Dark Glassmorphic Theme      |
+--------------------------------------------------------------+
                               |
                               |  HTTP REST / API Calls
                               v
+--------------------------------------------------------------+
|                   BACKEND SERVER (Express.js)                |
|  - REST API Routing    - Fallback Regex Parser               |
|  - Gemini AI Client    - Local JSON DB File Seeder           |
+--------------------------------------------------------------+
                               |
                               +---> Local DB: database.json
```

---

## 🗺️ System Flow Diagram

The flowchart below visualizes the integration between the Citizen client interface, the local storage caching layers, the Node.js API server, the fallback rules-engine, and the volunteer response loops:

```mermaid
graph TD
    classDef citizen fill:#2e86de,stroke:#fff,stroke-width:2px,color:#fff;
    classDef volunteer fill:#1dd1a1,stroke:#fff,stroke-width:2px,color:#fff;
    classDef admin fill:#ff4b5c,stroke:#fff,stroke-width:2px,color:#fff;
    classDef server fill:#2c3e50,stroke:#fff,stroke-width:2px,color:#fff;

    %% Citizen Flow
    subgraph "Citizen Interface"
        C1["Citizen Accesses App"]:::citizen --> C2{"Network Status?"}:::citizen
        C2 -- "Online" --> C3["Active Live Sync & REST Calls"]:::citizen
        C2 -- "Offline" --> C4["Toggle Offline Mode Banner"]:::citizen
        
        %% SOS Beacon
        C_SOS["Trigger Pulsing SOS Beacon"]:::citizen --> C_SOS_Check{"Online?"}:::citizen
        C_SOS_Check -- "Yes" --> C_SOS_Online["Broadcast SOS (Coordinates + Severity)"]:::citizen
        C_SOS_Check -- "No" --> C_SOS_Offline["Cache Alert in LocalStorage Queue"]:::citizen
        C_SOS_Offline -.->|Reconnection Event| C_SOS_Online
        
        %% AI Chatbot
        C_Chat["Emergency Chatbot Query"]:::citizen --> C_Chat_Check{"Online?"}:::citizen
        C_Chat_Check -- "Yes" --> C_Chat_Online["Query Google Gemini API"]:::citizen
        C_Chat_Check -- "No" --> C_Chat_Offline["Local Rule-based Fallback Parser"]:::citizen
    end

    %% Server Logic
    subgraph "Express Server & Databases"
        C_SOS_Online --> S_SOS["/api/emergencies/sos"]:::server
        S_SOS --> DB_Write[("database.json")]:::server
        C_Chat_Online --> S_Gemini["askGemini Service"]:::server
        S_Gemini -.->|Query| Gemini_REST["Gemini REST API"]:::server
        
        %% Hazard Reports
        C_Rep["Report Hazards / Share Supplies"]:::citizen --> S_Rep["/api/reports"]:::server
        S_Rep --> DB_Write
    end

    %% Volunteer Flow
    subgraph "Volunteer Network"
        V_Switch["Switch to Volunteer Role"]:::volunteer --> V_List["List Pending Beacons Map"]:::volunteer
        V_List --> V_Claim["Claim Rescue Mission"]:::volunteer
        V_Claim --> S_Update["/api/emergencies/:id/status"]:::volunteer
        S_Update --> DB_Write
        
        %% Routing
        V_Claim --> V_Route["Request Detour Navigation"]:::volunteer
        V_Route --> V_Avoid["Vite-Leaflet Engine: Bypasses Red Danger Zones"]:::volunteer
    end

    %% Admin Flow
    subgraph "Admin Command Desk"
        A_Console["Admin Dashboard"]:::admin --> A_Warn["Broadcast Warning Alerts"]:::admin
        A_Warn --> A_TTS["AI Voice TTS reads warning to all Citizens"]:::admin
        
        A_Console --> A_Sim["Simulate Disaster Event"]:::admin
        A_Sim --> S_Sim["/api/admin/simulate-disaster"]:::admin
        S_Sim --> DB_Write
    end
    
    %% Style links
    DB_Write --> AN_Data["Update Live Analytics Dashboard"]:::server
```

---

## 🚀 Key Features Detailed

### 1. Indian Context Localization (Mumbai)
- **Mapping Center**: OpenStreetMap defaults to Bandra Kurla Complex (BKC), Mumbai (`19.0760, 72.8777`).
- **Emergency Helplines**: Built-in direct link helplines for National Emergency (`112`), NDRF (`1078`), and Ambulance (`108` / `102`).
- **Shelters & Venues**: Real-world mock locations such as *Dharavi Town Hall Shelter*, *Bandra Sports Complex*, *Dadar Temple Community Hall*, and *Kurla Station Relief Camp*.
- **Danger Zones**: Pre-loaded flood warning parameters near the *Mithi River (Kurla)* and live powerline failures in *Sion*.

### 2. AI Safe Detour Routing
- Evaluates routes between citizens, shelters, and hospitals (*KEM Hospital*, *Lilavati Medical Center*).
- If the direct path crosses any active red **Danger Zone** (e.g. active flood boundary), the algorithm plots intermediate offsets to detour around hazards.

### 3. Accessible Speech Warnings (TTS)
- Broadcasts critical alerts (Critical/High severity) out loud using the web browser's native **SpeechSynthesis API**.
- Assists visually impaired, elderly, and distracted citizens during panic-inducing events.

### 4. Offline Synchronization
- Detects browser disconnects immediately, rendering an offline UI banner.
- Queues emergency SOS signals locally inside `localStorage` and automatically syncs them to the backend server the instant network connectivity is restored.

### 5. Community Supply Sharing Portal
- Enables citizens to register surplus rescue materials (blankets, water purifiers, transport trucks) on the live map.
- Volunteers and Admins can coordinate pickup locations and claim them once gathered.
