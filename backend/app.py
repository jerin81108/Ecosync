"""
EcoSync Backend Server - FastAPI
Provides REST APIs for:
- Live Sensor Ingestion (ESP32 / Simulator)
- Digital Twin State Sync
- AI Predictive Intelligence & Optimizations
- Carbon Emission Calculations
- Automated Report Generation
"""

import time
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from backend.agent import ai_agent
except ImportError:
    from agent import ai_agent

app = FastAPI(
    title="EcoSync API",
    description="Predictive Digital Twin for Zero-Emission Factories",
    version="1.0.0"
)

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory Datastore for Hackathon Demo
EMISSION_FACTOR = 0.82  # kg CO2 per kWh
CARBON_BUDGET = 50.0   # kg CO2 daily limit

state: Dict[str, Any] = {
    "telemetry": {
        "co2": 420.0,
        "temp": 36.2,
        "humidity": 60.5,
        "power": 15.0,
        "carbon": round(15.0 * EMISSION_FACTOR, 2),
        "budget": CARBON_BUDGET,
        "remaining": round(CARBON_BUDGET - (15.0 * EMISSION_FACTOR), 2),
        "timestamp": datetime.now().isoformat()
    },
    "machines": [
        {"id": 1, "name": "Machine 1", "type": "CNC Lathe", "temp": 42, "load": 72, "vibr": "Normal", "status": "online"},
        {"id": 2, "name": "Machine 2", "type": "Hydraulic Press", "temp": 78, "load": 94, "vibr": "High", "status": "warning"},
        {"id": 3, "name": "Machine 3", "type": "Injection Molder", "temp": 89, "load": 98, "vibr": "Critical", "status": "danger"},
        {"id": 4, "name": "Machine 4", "type": "Assembly Robot", "temp": 38, "load": 55, "vibr": "Normal", "status": "online"},
        {"id": 5, "name": "Machine 5", "type": "Welding Unit", "temp": 0, "load": 0, "vibr": "Off", "status": "offline"},
    ],
    "alerts": [
        {"id": 1, "type": "critical", "title": "Machine-3 Critical Temperature Spike", "msg": "Core temperature reached 89°C. Predictive failure in 5 mins.", "time": "2 mins ago"},
        {"id": 2, "type": "critical", "title": "High Carbon Emission Alert", "msg": "Factory emission rate exceeding baseline by 28%. Projected limit breach.", "time": "5 mins ago"},
        {"id": 3, "type": "warning", "title": "Machine-2 Abnormal Vibration", "msg": "Frequency harmonics detected at 142 Hz. Bearing load warning.", "time": "12 mins ago"},
        {"id": 4, "type": "info", "title": "Digital Twin Synchronized", "msg": "All 5 machine telemetries synced with ESP32 gateway.", "time": "18 mins ago"},
    ],
    "history": []
}


# ==================== DATA MODELS ====================
class SensorReading(BaseModel):
    co2: Optional[float] = None
    temp: Optional[float] = None
    humidity: Optional[float] = None
    power: Optional[float] = None
    machine_id: Optional[int] = None
    vibration: Optional[str] = None


class ActionApproval(BaseModel):
    approved_actions: List[str]


# ==================== API ENDPOINTS ====================

@app.get("/")
def root():
    return {
        "system": "EcoSync Predictive Digital Twin",
        "status": "Online",
        "version": "1.0.0",
        "endpoints": ["/api/live-data", "/api/sensor-data", "/api/approve-actions", "/api/reports"]
    }


@app.get("/api/live-data")
def get_live_data():
    """
    Returns live readings, calculated carbon metrics, active machine states,
    and dynamically analyzed AI predictions and recommendations.
    """
    telemetry = state["telemetry"]
    ai_insights = ai_agent.analyze_and_predict(telemetry, machines=state["machines"])

    return {
        **telemetry,
        "machines": state["machines"],
        "alerts": state["alerts"],
        "predictions": ai_insights["predictions"],
        "recommendations": ai_insights["recommendations"]
    }


@app.post("/api/sensor-data")
def ingest_sensor_data(reading: SensorReading):
    """
    Ingests sensor data from ESP32 or Python simulator,
    computes carbon footprint, updates state, and invokes AI Agent.
    """
    t = state["telemetry"]

    if reading.co2 is not None:
        t["co2"] = round(reading.co2, 1)
    if reading.temp is not None:
        t["temp"] = round(reading.temp, 1)
    if reading.humidity is not None:
        t["humidity"] = round(reading.humidity, 1)
    if reading.power is not None:
        t["power"] = round(reading.power, 2)

    # Calculate carbon emission: Power * 0.82
    t["carbon"] = round(t["power"] * EMISSION_FACTOR, 2)
    t["remaining"] = round(CARBON_BUDGET - t["carbon"], 2)
    t["timestamp"] = datetime.now().isoformat()

    # If specific machine reading
    if reading.machine_id is not None:
        for m in state["machines"]:
            if m["id"] == reading.machine_id:
                if reading.temp is not None:
                    m["temp"] = int(reading.temp)
                if reading.vibration is not None:
                    m["vibr"] = reading.vibration

    # Record in history & AI memory
    ai_agent.record_reading(dict(t))
    state["history"].append(dict(t))
    if len(state["history"]) > 100:
        state["history"].pop(0)

    # Check for threshold alerts
    if t["co2"] > 600:
        state["alerts"].insert(0, {
            "id": int(time.time()),
            "type": "critical",
            "title": "Severe CO₂ Emission Detected",
            "msg": f"Sensor detected {t['co2']} ppm. Exhaust scrubbers initiated.",
            "time": "Just now"
        })

    return {"status": "success", "carbon_calculated": t["carbon"], "reading": t}


@app.post("/api/approve-actions")
def approve_actions(approval: ActionApproval):
    """
    Manager approves recommended AI optimizations.
    Executes automated load shifting, cooling, and frequency throttling.
    """
    executed = []
    # Machine 3 cooling & load drop
    for m in state["machines"]:
        if m["id"] == 3:
            m["temp"] = 68
            m["load"] = 72
            m["vibr"] = "Normal"
            m["status"] = "online"
            executed.append("Machine 3 Throttled & Cooled")
        if m["id"] == 2:
            m["load"] = 80
            m["status"] = "online"
            executed.append("Machine 2 Load Rebalanced")

    # Lower overall power consumption
    state["telemetry"]["power"] = 12.0
    state["telemetry"]["carbon"] = round(12.0 * EMISSION_FACTOR, 2)
    state["telemetry"]["remaining"] = round(CARBON_BUDGET - state["telemetry"]["carbon"], 2)

    return {
        "status": "success",
        "message": "AI Optimizations successfully executed on factory line.",
        "executed_actions": executed,
        "new_carbon_level": state["telemetry"]["carbon"]
    }
class ChatRequest(BaseModel):
    message: str


@app.post("/api/chat")
def chat_with_assistant(req: ChatRequest):
    """
    EcoSync AI Factory Assistant.
    Specialized strictly in the EcoSync Predictive Digital Twin project.
    Answers technical questions, explains telemetry/algorithms, guides navigation,
    and provides pitch guidance for hackathons.
    """
    user_msg = req.message.strip().lower()
    t = state["telemetry"]
    m3 = next((m for m in state["machines"] if m["id"] == 3), {})
    m2 = next((m for m in state["machines"] if m["id"] == 2), {})
    m1 = next((m for m in state["machines"] if m["id"] == 1), {})
    m4 = next((m for m in state["machines"] if m["id"] == 4), {})
    m5 = next((m for m in state["machines"] if m["id"] == 5), {})

    # Action: Approve / Fix / Mitigate
    if any(k in user_msg for k in ["approve", "mitigate", "fix machine", "cool down", "cool machine", "apply action"]):
        # Execute automated mitigation
        for m in state["machines"]:
            if m["id"] == 3:
                m["temp"] = 68
                m["load"] = 74
                m["vibr"] = "Normal"
                m["status"] = "online"
            if m["id"] == 2:
                m["load"] = 80
                m["vibr"] = "Normal"
                m["status"] = "online"
        state["telemetry"]["power"] = 12.1
        state["telemetry"]["temp"] = 34.0
        state["telemetry"]["co2"] = 395
        state["telemetry"]["carbon"] = round(12.1 * EMISSION_FACTOR, 2)
        state["telemetry"]["remaining"] = round(CARBON_BUDGET - state["telemetry"]["carbon"], 2)

        return {
            "reply": (
                "⚡ **AI Optimizations Successfully Executed!**\n\n"
                "- **Machine 3 (Injection Molder):** Throttled speed by 25%, engaged Secondary Chiller B. Core temperature dropped from 89°C to **68°C** (Safe).\n"
                "- **Machine 2 (Hydraulic Press):** Batch #409 shifted to Assembly Robot 4. Load stabilized at **80%**.\n"
                "- **Power Consumption:** Dropped to **12.1 kWh**.\n"
                "- **Carbon Emission:** Reduced to **9.9 kg CO₂** (well inside the 50 kg daily budget).\n\n"
                "The factory digital twin has cleared all critical thermal trip warnings!"
            ),
            "suggested_action": "approve_mitigation"
        }

    # 1. Machine Overheating & Failure questions
    if "machine 3" in user_msg or "overheat" in user_msg or "machine-3" in user_msg or "injection molder" in user_msg:
        return {
            "reply": (
                f"⚠️ **Machine 3 (Injection Molder) Status Report:**\n\n"
                f"- **Current Temp:** {m3.get('temp', 89)}°C (Thermal trip point: 95°C)\n"
                f"- **Mechanical Load:** {m3.get('load', 98)}%\n"
                f"- **Vibration:** {m3.get('vibr', 'Critical')}\n"
                f"- **AI Prediction:** 94% probability of thermal trip within 5 minutes.\n\n"
                f"**How to solve it:** Click the **'Approve All Actions'** button on the Overview page or ask me to *\"Approve actions\"*! "
                f"The AI will immediately throttle Machine-3 load by 25% and activate Secondary Chiller Unit B, dropping temperature to 68°C."
            ),
            "suggested_action": "approve_mitigation"
        }

    # 2. Machine 2 Hydraulic questions
    if "machine 2" in user_msg or "machine-2" in user_msg or "hydraulic" in user_msg:
        return {
            "reply": (
                f"⚠️ **Machine 2 (Hydraulic Press) Status:**\n\n"
                f"- **Operating Load:** {m2.get('load', 94)}%\n"
                f"- **Temperature:** {m2.get('temp', 78)}°C\n"
                f"- **Vibration:** {m2.get('vibr', 'High')} (142 Hz harmonic flutter from valve micro-cavitation)\n"
                f"- **AI Prediction:** 87% chance of emergency valve trip.\n\n"
                f"**Recommended Fix:** Shift Batch #409 to Assembly Robot 4 to rebalance floor capacity and relieve hydraulic pressure."
            ),
            "suggested_action": "navigate_twin"
        }

    # 3. Machine 1, 4, 5 & All Machines
    if "all machines" in user_msg or "machines" in user_msg or "factory floor" in user_msg or "machine 1" in user_msg or "machine 4" in user_msg or "machine 5" in user_msg:
        return {
            "reply": (
                "🏭 **EcoSync Factory Floor Machines Overview:**\n\n"
                f"1. **Machine 1 (CNC Lathe):** {m1.get('temp', 42)}°C | Load: {m1.get('load', 72)}% | Status: `Online` (Nominal)\n"
                f"2. **Machine 2 (Hydraulic Press):** {m2.get('temp', 78)}°C | Load: {m2.get('load', 94)}% | Status: `Warning` (Abnormal vibration 142 Hz)\n"
                f"3. **Machine 3 (Injection Molder):** {m3.get('temp', 89)}°C | Load: {m3.get('load', 98)}% | Status: `Critical` (Thermal runaway threat)\n"
                f"4. **Machine 4 (Assembly Robot):** {m4.get('temp', 38)}°C | Load: {m4.get('load', 55)}% | Status: `Online` (Ready for batch rebalance)\n"
                f"5. **Machine 5 (Welding Unit):** 0°C | Load: 0% | Status: `Maintenance` (Scheduled overhaul)\n\n"
                "Would you like me to open the Digital Twin floor view?"
            ),
            "suggested_action": "navigate_twin"
        }

    # 4. How prediction works / AI algorithm
    if ("how" in user_msg or "explain" in user_msg) and ("predict" in user_msg or "algorithm" in user_msg or "work" in user_msg or "model" in user_msg or "ai" in user_msg):
        return {
            "reply": (
                "🔮 **How the EcoSync AI Prediction Works:**\n\n"
                "Unlike traditional reactive SCADA alarms that sound only after equipment is damaged, EcoSync uses proactive forecasting:\n\n"
                "1. **Rate-of-Change Analysis (ΔT / Δt):** Monitors temperature gradient velocity across rolling 30-sample sliding windows.\n"
                "2. **Time-to-Trip Calculation:** `(Trip Limit [95°C] - Current Temp) / Temp Rise Rate`\n"
                "3. **Multi-Sensor Correlation Engine:** Fuses thermal drift, FFT vibration harmonics (e.g. 142 Hz bearing flutter), and instantaneous power draw to calculate failure probability: `P = min(98%, 70% + (T - 45) * 1.2)`.\n"
                "4. **Human-in-the-Loop (HITL) Prescriptive Control:** Automatically formulates closed-loop mitigations (throttling, chiller engagement, load shifting) with one-click manager sign-off."
            ),
            "suggested_action": "navigate_predictions"
        }

    # 5. Carbon Calculation questions
    if "carbon" in user_msg or "emission" in user_msg or "co2" in user_msg or "budget" in user_msg:
        return {
            "reply": (
                f"🌍 **Carbon Emission Calculation & Budget:**\n\n"
                f"- **Core Formula:** `Carbon Emitted (kg CO₂) = Power (kWh) × 0.82 (Grid Emission Factor)`\n"
                f"- **Current Power Draw:** {t['power']} kWh\n"
                f"- **Current Carbon Rate:** {t['carbon']} kg CO₂\n"
                f"- **Daily Carbon Budget:** {t['budget']} kg CO₂ (Remaining: {t['remaining']} kg)\n"
                f"- **Ambient CO₂ Level:** {t['co2']} ppm (Safe limit < 500 ppm)\n\n"
                f"EcoSync calculates trajectory 30 minutes forward to alert operators before the 50 kg daily ceiling is breached."
            ),
            "suggested_action": "navigate_analytics"
        }

    # 6. Judge Pitch & Presentation Guidance
    if "judge" in user_msg or "pitch" in user_msg or "presentation" in user_msg or "demo" in user_msg:
        return {
            "reply": (
                "🎤 **Hackathon Judge Pitch Script (30 Seconds):**\n\n"
                "\"Judges, traditional factories are purely reactive. When Machine-3 overheats or carbon limits breach, downtime and environmental damage have already occurred.\n\n"
                "**EcoSync is a Predictive Digital Twin for Zero-Emission Factories.** We fuse real-time IoT telemetry—CO₂, temperature velocity, vibration harmonics, and power draw—to predict industrial failures **5 to 30 minutes before they happen**.\n\n"
                "With our **Human-In-The-Loop AI Optimization**, the factory manager approves recommended actions with one click. EcoSync automatically throttles equipment, engages secondary chillers, rebalances batch lines, and maintains zero-emission compliance!\""
            )
        }

    # 7. Report generation guidance
    if "report" in user_msg or "pdf" in user_msg or "export" in user_msg or "audit" in user_msg:
        return {
            "reply": (
                "📄 **Factory Reports & ESG Compliance:**\n\n"
                "EcoSync provides 4 audit report formats:\n"
                "1. **Daily Summary Report:** Sensor telemetry, carbon total, and power draw.\n"
                "2. **Weekly Analytics Report:** Trend history and OEE efficiency.\n"
                "3. **Emission Compliance (ESG):** Regulatory footprint vs. 50 kg cap.\n"
                "4. **AI Insights Report:** Prediction accuracy and mitigation logs.\n\n"
                "Click below to generate a report instantly or switch to the Reports tab!"
            ),
            "suggested_action": "generate_report"
        }

    # 8. Hardware & Sensors questions
    if "sensor" in user_msg or "esp32" in user_msg or "hardware" in user_msg or "arduino" in user_msg or "pin" in user_msg:
        return {
            "reply": (
                "📡 **Hardware & Sensor Gateway Architecture:**\n\n"
                "- **Microcontroller:** ESP32 running Arduino C++ (`sensors/esp32.ino`)\n"
                "- **CO₂ Sensing:** MQ-135 Gas Sensor connected to Analog Pin 34 (380–1000 ppm)\n"
                "- **Temperature & Humidity:** DHT22 Sensor on Digital Pin 4\n"
                "- **Current & Power:** ACS712 Hall-Effect Sensor on Analog Pin 35 (230V mains conversion)\n"
                "- **Telemetry Protocol:** Wi-Fi HTTP POST JSON to `/api/sensor-data` every 5 seconds\n"
                "- **Hardware-Free Simulation:** Run `python simulator.py gradual_overheat` in the backend folder."
            )
        }

    # 9. Simulator details
    if "simulator" in user_msg or "simulate" in user_msg:
        return {
            "reply": (
                "🧪 **EcoSync Sensor Simulator (`backend/simulator.py`):**\n\n"
                "Enables realistic live demos without physical hardware:\n"
                "- `python simulator.py gradual_overheat` : Simulates Machine-3 thermal runaway (65°C → 89°C) and vibration spike.\n"
                "- `python simulator.py spike` : Simulates sudden carbon emission & power surges.\n"
                "- `python simulator.py normal` : Nominal steady-state factory operation.\n\n"
                "All telemetry streams directly into the dashboard with real-time recalculations."
            )
        }

    # 10. Navigation commands
    if "digital twin" in user_msg or "twin" in user_msg:
        return {
            "reply": "🏭 Opening the **Digital Twin Floor**! Here you can monitor all 5 industrial machines with live statuses, temperatures, and gear animation states.",
            "suggested_action": "navigate_twin"
        }

    if "prediction" in user_msg:
        return {
            "reply": "🔮 Opening the **Predictive Analytics Engine**! View live failure probabilities, gradient velocities, and 7-day model accuracy history.",
            "suggested_action": "navigate_predictions"
        }

    if "analytic" in user_msg or "chart" in user_msg or "graph" in user_msg or "score" in user_msg or "oee" in user_msg:
        return {
            "reply": "📊 Opening the **Factory Analytics Dashboard**! Inspect 24-hour carbon emission curves, energy breakdown per machine, and our 75% Factory Efficiency (OEE) score.",
            "suggested_action": "navigate_analytics"
        }

    if "alert" in user_msg:
        return {
            "reply": f"⚠️ Opening the **Alert Center**! There are currently {len(state['alerts'])} active alerts including the Machine-3 temperature spike and carbon emission warning.",
            "suggested_action": "navigate_alerts"
        }

    if "overview" in user_msg or "dashboard" in user_msg or "home" in user_msg:
        return {
            "reply": "🏭 Switching to the **Factory Overview** screen! Here you can see key metric cards, live carbon gauge, real-time charts, and the AI Recommendation approval card.",
            "suggested_action": "navigate_overview"
        }

    # 11. What is EcoSync / Project Overview
    if "what is ecosync" in user_msg or "about" in user_msg or "project" in user_msg or "concept" in user_msg:
        return {
            "reply": (
                "🏭 **About EcoSync:**\n\n"
                "**EcoSync is a Predictive Digital Twin for Zero-Emission Smart Manufacturing.**\n\n"
                "- **The Problem:** Conventional factories operate reactively—waiting until machines overheat, bearings fail, or emissions breach legal ceilings.\n"
                "- **The Solution:** EcoSync uses real-time IoT sensors (ESP32) and AI pattern analysis on temperature velocity (ΔT/Δt) and vibration harmonics to predict failures before they happen.\n"
                "- **Closed-Loop Action:** Recommends concrete mitigating actions with Human-in-the-Loop manager approval to keep the factory energy-efficient and zero-emission."
            ),
            "suggested_action": "navigate_overview"
        }

    # 12. Manpower & Company Revenue Loss Protection
    if any(k in user_msg for k in ["manpower", "man power", "revenue", "loss of the company", "loss of company", "production loss", "deficit", "workforce", "maintain revenue", "technician"]):
        return {
            "reply": (
                "⚠️ **Machinery Changes & Company Revenue Protection Protocol:**\n\n"
                "When machineries are throttled (such as reducing Machine-3 speed by -25% to prevent an emergency $45,000 thermal trip), equipment output drops by **-18.4% (~160 units/hr)**.\n\n"
                "- **Company Revenue Risk:** A projected deficit of **-$3,850** per shift.\n"
                "- **Automated Pop-Up Protocol:** EcoSync automatically displays a **Revenue Protection Pop-up** alerting managers to increase floor manpower.\n"
                "- **Manpower Action:** Authorizing **+4 Auxiliary Technicians** across Assembly Line 4 compensates for the reduced machine speed and maintains the company's daily revenue target at 100%."
            ),
            "suggested_action": "show_manpower_modal"
        }

    # 13. Strict Scope Boundary - If outside EcoSync
    irrelevant_keywords = ["recipe", "sports", "football", "cricket", "movie", "weather in", "song", "poem about", "president", "bitcoin", "crypto", "joke"]
    if any(k in user_msg for k in irrelevant_keywords):
        return {
            "reply": (
                "🤖 **EcoSync Scope Notice:**\n\n"
                "I am your dedicated **EcoSync Digital Twin Assistant**, specialized strictly in this smart manufacturing platform.\n\n"
                "I cannot answer questions outside of EcoSync. However, I can help you with:\n"
                "- Machine health (Machine 1–5)\n"
                "- Live CO₂, temperature & carbon calculations\n"
                "- AI failure predictions & closed-loop mitigations\n"
                "- ESP32 hardware & sensor simulation\n"
                "- Hackathon judge pitch scripts & reports\n\n"
                "What would you like to explore in EcoSync?"
            )
        }

    # Default / Helpful Navigation Prompt
    return {
        "reply": (
            "👋 **Hello! I am your EcoSync Factory Copilot.**\n\n"
            "I have complete knowledge of this Predictive Digital Twin project. Here are questions you can ask me or tasks I can do for you:\n\n"
            "- ⚠️ *\"Why is Machine 3 in critical status?\"*\n"
            "- ⚡ *\"Approve all AI mitigations and cool Machine 3\"*\n"
            "- 🔮 *\"How does the AI predict machine failure?\"*\n"
            "- 🧮 *\"Explain the Carbon Emission calculation formula\"*\n"
            "- 🏭 *\"Show me the Digital Twin floor\"*\n"
            "- 🎤 *\"Give me the 30-second judge pitch script\"*\n"
            "- 📄 *\"Generate an ESG compliance report\"*\n"
            "- 📡 *\"What hardware sensors are used?\"*\n\n"
            "How can I assist you right now?"
        )
    }


@app.get("/api/reports")
def get_report_data():
    """Returns high-level summary suitable for PDF or printing."""
    t = state["telemetry"]
    return {
        "factory": "JCT Industrial Smart Facility",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "metrics": {
            "average_co2": t["co2"],
            "temperature": t["temp"],
            "power_consumed": t["power"],
            "carbon_emissions": t["carbon"],
            "carbon_budget_used_percent": round((t["carbon"] / CARBON_BUDGET) * 100, 1)
        },
        "digital_twin_status": "Synchronized",
        "machines_monitored": len(state["machines"]),
        "incident_mitigations": 4
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
