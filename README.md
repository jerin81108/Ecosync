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
