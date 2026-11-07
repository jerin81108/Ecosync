# 🏭 EcoSync — Predictive Digital Twin for Zero-Emission Factories

> **"Our Digital Twin doesn't just monitor current factory status. It uses AI pattern analysis on live and historical data to predict problems before they happen, recommends corrective solutions, and leads the factory toward safe, energy-efficient, and zero-emission operation."**

---

## 🌟 Hackathon Standout Features

### 1. Predictive Digital Twin (Not Just Reactive Monitoring)
- **Old System:** Waits until Machine-3 overheats or emissions breach limits, causing damage and waste.
- **EcoSync:** Continuously observes:
  - Temperature gradient velocity ($\Delta T / \Delta t$)
  - Power consumption anomalies
  - Multi-axis machine vibration harmonics
  - Real-time carbon emission trajectory

### 2. Standout AI Prediction Panel
```
⚠️ Machine-2 Failure Probability: 87%
🌍 Carbon Limit Exceed Chance (Next 30 min): 92%
⚡ Expected Energy Spike: +18%
✅ Recommended Action: Reduce Machine-2 Load by 20%
```

### 3. Closed-Loop AI Optimization & Manager Approval (HITL)
- AI recommends concrete mitigating actions:
  - *Throttle Machine-3 Speed by 25%*
  - *Engage Secondary Chiller Unit B*
  - *Rebalance Batch Load to Assembly Robot 4*
  - *Enable Dynamic Eco-Pulse Inverter Mode*
- With one click ("Approve All Actions"), optimizations are automatically applied across the Digital Twin floor.

### 4. Live Carbon Calculation Engine
$$\text{Carbon Emitted (kg CO}_2\text{)} = \text{Power (kWh)} \times 0.82 \text{ (Emission Factor)}$$
- Daily carbon budget tracking with real-time donut gauge.

### 5. 🏢 Interactive 2.5D Factory Floor Map & Machine Diagnostics
- Toggle between **2.5D Schematic Floor Layout Map** and Machine Cards.
- Factory divided into **Zone A (Precision Machining)**, **Zone B (Heavy Forming)**, and **Zone C (Assembly Line)**.
- Infrastructure flow visuals: **Chiller Loop 3 (8°C Glycol)** and **480V Solar Busway**.
- Click any machine node to open the **Deep Diagnostic Inspector**:
  - **Component Thermal Heatmap** (Drive Stator, Spindle Bearings, Hydraulic Manifold, Heat Exchanger).
  - **Live Vibration FFT Frequency Spectrum** (Canvas rendering 0-500 Hz with harmonic peak at 142 Hz).
  - **Remaining Useful Life (RUL)** prognostics countdown.
  - Closed-loop operator mitigations (Throttle speed, Engage Chiller, E-Stop, Dispatch Work Order).

### 6. 🧪 What-If Scenario Simulator & Carbon Sandbox ("Simulation Studio")
- Interactive digital sandbox allowing operators to stress-test scenarios before applying changes to the floor:
  - **Factory Production Load** (50% to 150%)
  - **Renewable Energy Share** (0% Coal Grid to 100% Rooftop Solar / Battery)
  - **Ambient Heatwave Offset** (-5°C to +15°C)
  - **Dynamic Eco-Pulse Inverter Modulation** & **Chiller Pre-Cooling** toggles
  - Presets: *Net-Zero Benchmark*, *Peak Production Rush*, *Night Shift Eco-Cycle*, *Summer Heatwave (+12°C)*.
- Real-time reactive projection outputs: Projected Power (kW), Hourly Carbon Rate (kg CO₂/hr), 8-Hour Shift Footprint, Equipment Stress Index (%), ESG Compliance Rating (A+ to F), and Carbon Tax Avoided ($).
- **"Apply Scenario to Live Digital Twin"** button to immediately sync simulated conditions into physical twin telemetry!

### 7. ☀️ Renewable Microgrid & BESS Energy Storage Manager
- Live monitoring of **Rooftop Solar PV Array** (8.6 kW, 920 W/m² irradiance, 92.4% efficiency).
- **BESS Lithium Battery Storage (60 kWh)** state of charge (76.0% SOC, 45.6 kWh stored).
- Dispatch Modes: **Auto Peak Shaving**, **Solar Priority**, and **Battery Reserve**.
- Carbon offset tracking: **18.4 kg CO₂ saved today** (~7.2 trees equivalent & $18.40 peak tariff saved).

### 8. 📋 Maintenance Work Order & Dispatch System
- Auto-generates official maintenance dispatch tickets with Lockout/Tagout (LOTO) checklists.
- Pre-filled replacement parts routing (e.g. *SKF 6205-2RS Ceramic Bearing*, *Glycol Chiller Filter*).
- Printable / downloadable industrial tickets with barcodes and assigned lead technicians.
- Real-time work order status resolution tracking.

### 9. 🔊 Industrial Audio Alarm Synthesizer & Speech Engine
- Synthesizes authentic industrial audio using the **Web Audio API**:
  - High-tech double chime on mitigation approvals and task completions.
  - Industrial pulsing alarm siren when critical alerts trigger.
- **Voice Alert Synthesizer** (Web Speech API) announces critical safety events over factory speakers.

### 10. 💰 AI Recommendations Economic & Workforce Loss Matrix
- Shows real-world business and operational consequences directly inside every AI recommendation card:
  - **Projected Shift Loss:** Exact throughput drops (e.g. *-18.4% capacity / -160 units/hr*) and shift revenue deficits (e.g. *-$3,850/shift*).
  - **Workforce Compensation Plan:** Exact personnel needed to offset the capacity deficit (e.g. *+4 Auxiliary Technicians, $1,200 shift labor*) deployed to manual buffer lines to fulfill quotas.
  - **Catastrophic Failure Averted & Net ROI:** Capital protection (e.g. *+$45,000 stator coil burnout prevented*) with clear net economic benefit (*+$39,950 net shift protection*).
  - **1-Click Inline Workforce Deployment:** Authorize and deploy compensatory technicians directly from any recommendation card.

### 11. 🚀 Factory Administration & Company Growth Journey (Fleet Scaling)
- Dynamic factory expansion page linked to the company's real-world industrial journey:
  - **Phase 1: Seed Prototype** (2 Machines: CNC Lathe + Assembly Robot) -> *Completed*
  - **Phase 2: Pilot Plant** (5 Machines: Lathe, Press, Molder, Robot, Welder) -> *Active Current Phase*
  - **Phase 3: Commercial Growth** (8 Machines: +Precision Laser Cutter, +Clean Heat Pump, +Eco Extruder) -> *1-Click Milestone Deploy*
  - **Phase 4: Megafactory Zero-Carbon** (12 Machines: +Additive 3D Metal Printer, +Autonomous AMR Fleet, +Clean Induction Furnace, +Automated QA Gantry) -> *1-Click Megafactory Deploy*
- Custom machine deployment modal with bay allocation, vibration calibration, and power rating.
- Bidirectional live synchronization: Dynamically creates new pods on the **2.5D Floor Map**, updates the **Digital Twin**, recalculates factory-wide power, workforce ratios, and carbon quotas.
- Full fleet table with maintenance toggling (`online` $\leftrightarrow$ `offline`), real-time load bars, and decommissioning.
- Backend REST endpoints: `GET/POST /api/machines`, `PUT/DELETE /api/machines/{id}`, `POST /api/admin/journey/scale`, and `GET /api/admin/factory-summary`.

---

## 🏗️ Project Architecture

```
ZERO-EMISSION (EcoSync)
│
├── frontend/ (Root)
│      ├── index.html           # Full Dashboard (Overview, Digital Twin, Predictions, Analytics, Alerts, Reports)
│      ├── src/style.css        # High-tech cyber dark theme, glassmorphism & animations
│      ├── src/main.js          # Chart.js visualizations, state management & live sync
│      ├── package.json
│      └── vite.config.js
│
├── backend/
│      ├── app.py               # FastAPI REST server & telemetry endpoints
│      ├── agent.py             # Digital Twin AI prediction & recommendation engine
│      ├── simulator.py         # Dummy sensor data generator for hardware-free demos
│      └── requirements.txt
│
├── sensors/
│      └── esp32.ino            # ESP32 Arduino gateway code with WiFi & sensor POST
│
└── reports/                    # Generated inspection & compliance PDFs
```

---

## 🚀 How to Run the Project

### 1. Start the Frontend (Vite)
```bash
# In d:\PERSONAL\Ecosync
npm install
npm run dev
```
Open browser at: **`http://localhost:5173`**

### 2. Start the Backend (FastAPI)
```bash
# In d:\PERSONAL\Ecosync\backend
pip install -r requirements.txt
python app.py
```
Backend runs at: **`http://localhost:8000`**

### 3. Run Live Sensor Simulation (For Hackathon Demo)
```bash
# In d:\PERSONAL\Ecosync\backend
python simulator.py gradual_overheat
```
Watch the telemetry, carbon calculations, and prediction panel update in real-time on your dashboard!

---

## 🎤 How to Pitch to the Judges

1. **The Hook:**
   > *"Most factories today are purely reactive. When a machine overheats or carbon limits exceed, the damage is already done. Today, we built EcoSync: a Predictive Digital Twin for Zero-Emission Smart Manufacturing."*

2. **The Demo:**
   - Log into the dashboard (`admin@ecosync.io` / `admin123`).
   - Show the **Live Sensor Telemetry** (CO₂, Temperature, Power).
   - Point out the **Carbon Emission Calculation** ($15 \text{ kWh} \times 0.82 = 12.3 \text{ kg CO}_2$).
   - Switch to the **Digital Twin Tab** to show Machine 3 vibrating in critical red.
   - Reveal the **AI Prediction Panel**: *"Our model detects a 94% probability of thermal trip within 5 minutes."*
   - Click **"Approve All Actions"** — show how the AI throttles the machine load, temperature drops to 68°C, and the danger clears!
   - Generate and download an **ESG Factory Report**.

3. **The Closing:**
   > *"EcoSync doesn't just show data. It solves industrial problems before they happen, saving energy, equipment, and our planet."*
