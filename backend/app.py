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
        {"id": 1, "name": "Machine 1", "type": "CNC Lathe", "bay": "Bay 1 - Machining", "temp": 42, "load": 72, "vibr": "Normal", "power": 3.8, "status": "online", "journey_phase": "Phase 1: Seed Prototype"},
        {"id": 2, "name": "Machine 2", "type": "Hydraulic Press", "bay": "Bay 2 - Stamping", "temp": 78, "load": 94, "vibr": "High", "power": 4.5, "status": "warning", "journey_phase": "Phase 1: Seed Prototype"},
        {"id": 3, "name": "Machine 3", "type": "Injection Molder", "bay": "Bay 3 - Molding", "temp": 89, "load": 98, "vibr": "Critical", "power": 5.2, "status": "danger", "journey_phase": "Phase 2: Pilot Plant"},
        {"id": 4, "name": "Machine 4", "type": "Assembly Robot", "bay": "Bay 4 - Robotics", "temp": 38, "load": 55, "vibr": "Normal", "power": 2.2, "status": "online", "journey_phase": "Phase 2: Pilot Plant"},
        {"id": 5, "name": "Machine 5", "type": "Welding Unit", "bay": "Bay 5 - Welding", "temp": 0, "load": 0, "vibr": "Off", "power": 0.0, "status": "offline", "journey_phase": "Phase 2: Pilot Plant"},
    ],
    "alerts": [
        {"id": 1, "type": "critical", "title": "Machine-3 Critical Temperature Spike", "msg": "Core temperature reached 89°C. Predictive failure in 5 mins.", "time": "2 mins ago"},
        {"id": 2, "type": "critical", "title": "High Carbon Emission Alert", "msg": "Factory emission rate exceeding baseline by 28%. Projected limit breach.", "time": "5 mins ago"},
        {"id": 3, "type": "warning", "title": "Machine-2 Abnormal Vibration", "msg": "Frequency harmonics detected at 142 Hz. Bearing load warning.", "time": "12 mins ago"},
        {"id": 4, "type": "info", "title": "Digital Twin Synchronized", "msg": "All 5 machine telemetries synced with ESP32 gateway.", "time": "18 mins ago"},
    ],
    "microgrid": {
        "solar_kw": 8.6,
        "solar_efficiency": 92.4,
        "bess_soc": 76.0,
        "bess_capacity_kwh": 60.0,
        "bess_current_kwh": 45.6,
        "bess_flow_kw": -2.8,
        "grid_import_kw": 6.4,
        "grid_carbon_intensity": 0.82,
        "solar_carbon_intensity": 0.0,
        "mode": "auto_peak_shaving",
        "avoided_co2_kg": 18.4,
        "equivalent_trees": 7.2
    },
    "work_orders": [
        {
            "id": "WO-2026-0894",
            "machine_id": 3,
            "machine_name": "Machine 3 (Injection Molder)",
            "bay": "Bay 2 - Section C",
            "priority": "Critical",
            "status": "Dispatched",
            "issue": "Spindle thermal runaway (89°C) & primary cooling fluid breakdown.",
            "parts": ["SKF 6205-2RS Ceramic Bearing", "Glycol Chiller Filter Cartridge", "Coolant 50/50 Mix"],
            "technician": "Marcus Vance (Shift Lead)",
            "loto_required": True,
            "created_at": "10 mins ago"
        },
        {
            "id": "WO-2026-0889",
            "machine_id": 2,
            "machine_name": "Machine 2 (Hydraulic Press)",
            "bay": "Bay 1 - Section B",
            "priority": "High",
            "status": "In Progress",
            "issue": "142 Hz harmonic vibration detected; proportional valve spool cavitation.",
            "parts": ["Hydraulic Valve Seal Kit #402", "ISO-VG 46 Hydraulic Oil"],
            "technician": "Elena Rostova (Hydraulics Spec)",
            "loto_required": True,
            "created_at": "1 hour ago"
        }
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


class SimulationScenario(BaseModel):
    factory_load: float = 100.0          # 50 - 150 %
    renewable_mix: float = 40.0          # 0 - 100 %
    ambient_temp_offset: float = 0.0     # -5 to +15 °C
    eco_pulse: bool = True
    chiller_pre_cool: bool = False


class WorkOrderCreate(BaseModel):
    machine_id: int
    machine_name: str
    bay: str
    priority: str
    issue: str
    parts: List[str]
    technician: str
    loto_required: bool = True


class MachineCreate(BaseModel):
    name: str
    type: str
    bay: Optional[str] = "Bay 1 - Machining"
    status: Optional[str] = "online"
    temp: Optional[float] = 38.0
    load: Optional[float] = 60.0
    vibr: Optional[str] = "Normal"
    power: Optional[float] = 3.5
    journey_phase: Optional[str] = "Phase 3 Expansion"


class MachineUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    bay: Optional[str] = None
    status: Optional[str] = None
    temp: Optional[float] = None
    load: Optional[float] = None
    vibr: Optional[str] = None
    power: Optional[float] = None
    journey_phase: Optional[str] = None


class JourneyScaleRequest(BaseModel):
    phase: int  # 3 (Commercial Scaling) or 4 (Megafactory)


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
        "microgrid": state.get("microgrid", {}),
        "work_orders": state.get("work_orders", []),
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


@app.get("/api/microgrid")
def get_microgrid_status():
    return state.get("microgrid", {})


@app.post("/api/microgrid/mode")
def set_microgrid_mode(payload: Dict[str, str]):
    mode = payload.get("mode", "auto_peak_shaving")
    if "microgrid" in state:
        state["microgrid"]["mode"] = mode
    return {"status": "success", "mode": mode}


@app.get("/api/work-orders")
def get_work_orders():
    return state.get("work_orders", [])


@app.post("/api/work-orders")
def create_work_order(wo: WorkOrderCreate):
    new_id = f"WO-2026-0{int(time.time()) % 1000:03d}"
    order = {
        "id": new_id,
        "machine_id": wo.machine_id,
        "machine_name": wo.machine_name,
        "bay": wo.bay,
        "priority": wo.priority,
        "status": "Dispatched",
        "issue": wo.issue,
        "parts": wo.parts,
        "technician": wo.technician,
        "loto_required": wo.loto_required,
        "created_at": "Just now"
    }
    state.setdefault("work_orders", []).insert(0, order)
    return {"status": "success", "work_order": order}


# ==================== MACHINE FLEET & ADMIN SCALING ENDPOINTS ====================

@app.get("/api/machines")
def get_machines():
    return state["machines"]


@app.post("/api/machines")
def add_machine(machine_in: MachineCreate):
    new_id = max([m["id"] for m in state["machines"]], default=0) + 1
    new_machine = {
        "id": new_id,
        "name": machine_in.name or f"Machine {new_id}",
        "type": machine_in.type,
        "bay": machine_in.bay or f"Bay {new_id} - Expansion",
        "temp": machine_in.temp if machine_in.temp is not None else 38.0,
        "load": machine_in.load if machine_in.load is not None else 60.0,
        "vibr": machine_in.vibr or "Normal",
        "power": machine_in.power if machine_in.power is not None else 3.5,
        "status": machine_in.status or "online",
        "journey_phase": machine_in.journey_phase or "Phase 3 Expansion"
    }
    state["machines"].append(new_machine)
    return {"status": "success", "machine": new_machine, "total_machines": len(state["machines"])}


@app.put("/api/machines/{machine_id}")
def update_machine(machine_id: int, updates: MachineUpdate):
    m = next((item for item in state["machines"] if item["id"] == machine_id), None)
    if not m:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    if updates.name is not None: m["name"] = updates.name
    if updates.type is not None: m["type"] = updates.type
    if updates.bay is not None: m["bay"] = updates.bay
    if updates.status is not None: m["status"] = updates.status
    if updates.temp is not None: m["temp"] = updates.temp
    if updates.load is not None: m["load"] = updates.load
    if updates.vibr is not None: m["vibr"] = updates.vibr
    if updates.power is not None: m["power"] = updates.power
    if updates.journey_phase is not None: m["journey_phase"] = updates.journey_phase
    
    return {"status": "success", "machine": m}


@app.delete("/api/machines/{machine_id}")
def delete_machine(machine_id: int):
    target = next((item for item in state["machines"] if item["id"] == machine_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Machine not found")
    state["machines"] = [m for m in state["machines"] if m["id"] != machine_id]
    return {"status": "success", "deleted_id": machine_id, "remaining_count": len(state["machines"])}


@app.post("/api/machines/{machine_id}/estop")
def estop_single_machine(machine_id: int):
    """Executes immediate Emergency Safe Stop (E-STOP) on a single machinery unit."""
    m = next((item for item in state["machines"] if item["id"] == machine_id), None)
    if not m:
        raise HTTPException(status_code=404, detail="Machine not found")
    m["load"] = 0
    m["temp"] = 28.0
    m["vibr"] = "Off"
    m["status"] = "offline"
    return {"status": "success", "message": f"EMERGENCY SAFE STOP applied to {m['name']}", "machine": m}


@app.post("/api/factory/estop")
def estop_entire_factory():
    """Executes immediate Plant-Wide Emergency Safe Stop (E-STOP) across all machines."""
    for m in state["machines"]:
        m["load"] = 0
        m["status"] = "offline"
        m["vibr"] = "Off"
        m["temp"] = min(m.get("temp", 30.0), 30.0)
    state["telemetry"]["power"] = 3.2
    state["telemetry"]["carbon"] = round(3.2 * EMISSION_FACTOR, 2)
    state["telemetry"]["remaining"] = round(CARBON_BUDGET - state["telemetry"]["carbon"], 2)
    return {
        "status": "success",
        "message": "PLANT-WIDE EMERGENCY SAFE STOP EXECUTED. All drives isolated.",
        "telemetry": state["telemetry"],
        "machines": state["machines"]
    }


@app.post("/api/factory/reset")
def reset_factory_nominal():
    """Restores factory machinery to nominal online baseline."""
    for m in state["machines"]:
        m["load"] = 65
        m["status"] = "online"
        m["vibr"] = "Normal"
        m["temp"] = 42.0
    state["telemetry"]["power"] = 14.5
    state["telemetry"]["carbon"] = round(14.5 * EMISSION_FACTOR, 2)
    state["telemetry"]["remaining"] = round(CARBON_BUDGET - state["telemetry"]["carbon"], 2)
    return {
        "status": "success",
        "message": "Factory restored to nominal production envelope.",
        "telemetry": state["telemetry"],
        "machines": state["machines"]
    }


@app.post("/api/admin/journey/scale")
def scale_company_journey(req: JourneyScaleRequest):
    """
    Expands factory machinery fleet in bulk according to the company growth journey milestones.
    Phase 3: Commercial Scaling (+3 machines: Laser Cutter, Clean Heat Pump, Eco Extruder)
    Phase 4: Megafactory Zero-Carbon (+4 machines: Additive 3D Metal Printer, Autonomous AMR Fleet, Clean Induction Furnace, Automated QA Gantry)
    """
    added_machines = []

    if req.phase == 3:
        phase3_presets = [
            {"name": "Machine 6", "type": "Precision Laser Cutter", "bay": "Bay 6 - Precision Cell", "temp": 39.0, "load": 65.0, "vibr": "Normal", "power": 4.2, "status": "online", "journey_phase": "Phase 3: Commercial Growth"},
            {"name": "Machine 7", "type": "Clean Heat Pump", "bay": "Bay 7 - HVAC & Recovery", "temp": 31.5, "load": 50.0, "vibr": "Low", "power": 2.8, "status": "online", "journey_phase": "Phase 3: Commercial Growth"},
            {"name": "Machine 8", "type": "Eco Extruder Unit", "bay": "Bay 8 - Polymer Forming", "temp": 44.0, "load": 68.0, "vibr": "Normal", "power": 3.9, "status": "online", "journey_phase": "Phase 3: Commercial Growth"}
        ]
        for preset in phase3_presets:
            if not any(m["type"] == preset["type"] for m in state["machines"]):
                new_id = max([m["id"] for m in state["machines"]], default=0) + 1
                preset["id"] = new_id
                state["machines"].append(preset)
                added_machines.append(preset)

    elif req.phase == 4:
        phase4_presets = [
            {"name": "Machine 9", "type": "Additive 3D Metal Printer", "bay": "Bay 9 - Additive Cell", "temp": 34.0, "load": 58.0, "vibr": "Normal", "power": 3.2, "status": "online", "journey_phase": "Phase 4: Megafactory"},
            {"name": "Machine 10", "type": "Autonomous AMR Fleet Hub", "bay": "Bay 10 - Logistics Grid", "temp": 28.0, "load": 45.0, "vibr": "Low", "power": 1.9, "status": "online", "journey_phase": "Phase 4: Megafactory"},
            {"name": "Machine 11", "type": "Clean Induction Furnace", "bay": "Bay 11 - Metallurgy", "temp": 48.0, "load": 62.0, "vibr": "Normal", "power": 6.4, "status": "online", "journey_phase": "Phase 4: Megafactory"},
            {"name": "Machine 12", "type": "Automated Vision QA Gantry", "bay": "Bay 12 - Quality Inspection", "temp": 26.5, "load": 40.0, "vibr": "Low", "power": 1.4, "status": "online", "journey_phase": "Phase 4: Megafactory"}
        ]
        for preset in phase4_presets:
            if not any(m["type"] == preset["type"] for m in state["machines"]):
                new_id = max([m["id"] for m in state["machines"]], default=0) + 1
                preset["id"] = new_id
                state["machines"].append(preset)
                added_machines.append(preset)

    return {
        "status": "success",
        "phase": req.phase,
        "added_count": len(added_machines),
        "added_machines": added_machines,
        "total_fleet_size": len(state["machines"])
    }


@app.get("/api/admin/factory-summary")
def get_factory_summary():
    machines = state["machines"]
    total = len(machines)
    online_count = sum(1 for m in machines if m["status"] == "online")
    total_power = sum(m.get("power", 3.0) for m in machines)
    base_workers = 12 + max(0, (total - 5) * 2)

    journey_stage = "Phase 2: Pilot Plant"
    if total >= 12:
        journey_stage = "Phase 4: Megafactory Zero-Carbon"
    elif total >= 8:
        journey_stage = "Phase 3: Commercial Growth"

    return {
        "total_machines": total,
        "online_count": online_count,
        "rated_power_kw": round(total_power, 1),
        "total_workforce": base_workers,
        "journey_stage": journey_stage,
        "carbon_quota_per_machine": round(CARBON_BUDGET / max(1, total), 2)
    }


@app.get("/api/machines/{machine_id}/diagnostics")
def get_machine_diagnostics(machine_id: int):
    m = next((item for item in state["machines"] if item["id"] == machine_id), None)
    if not m:
        raise HTTPException(status_code=404, detail="Machine not found")

    is_hot = m["temp"] > 70
    is_danger = m["status"] == "danger"
    stator_temp = round(m["temp"] * 1.02, 1)
    bearing_temp = round(m["temp"] * 1.04, 1) if is_hot else round(m["temp"] * 0.95, 1)
    hydraulic_temp = round(m["temp"] * 0.92, 1)
    chiller_temp = 28.4 if not is_hot else 34.2

    fft_peak = 142.0 if machine_id == 2 else (380.0 if machine_id == 3 else 60.0)
    fft_amp = 0.88 if machine_id == 2 else (0.95 if machine_id == 3 else 0.18)
    rul_hours = 0.08 if is_danger else (1.4 if m["status"] == "warning" else 720.0)

    return {
        "machine": m,
        "diagnostics": {
            "bay": f"Bay {machine_id} - Production Zone {'A' if machine_id == 1 else ('B' if machine_id in [2,3] else 'C')}",
            "model": f"Eco-Unit Series {machine_id * 100 + 42}",
            "serial": f"SN-2026-0{machine_id}-ECO",
            "stator_temp": stator_temp,
            "bearing_temp": bearing_temp,
            "hydraulic_temp": hydraulic_temp,
            "chiller_temp": chiller_temp,
            "fft_peak_freq": fft_peak,
            "fft_peak_amp": fft_amp,
            "rul_hours": rul_hours,
            "nominal_mtbf": 8400,
            "chiller_loop_active": is_hot,
            "eco_pulse": m["status"] == "online"
        }
    }


@app.post("/api/simulation/calculate")
def calculate_simulation(scenario: SimulationScenario):
    """
    Computes What-If scenario projections dynamically:
    Carbon output, Power load, Equipment Stress Index, ESG rating, Cost per shift.
    """
    load_ratio = scenario.factory_load / 100.0
    renew_ratio = scenario.renewable_mix / 100.0
    temp_offset = scenario.ambient_temp_offset

    chiller_draw = 1.8 if (temp_offset > 5 or scenario.chiller_pre_cool) else 0.8
    pulse_saving = 0.88 if scenario.eco_pulse else 1.0
    power_kw = round((14.0 * (load_ratio ** 1.3) + chiller_draw) * pulse_saving, 2)

    effective_emission_factor = round((1.0 - renew_ratio) * EMISSION_FACTOR, 3)
    carbon_rate = round(power_kw * effective_emission_factor, 2)
    daily_projected = round(carbon_rate * 4.0, 1)

    thermal_stress = min(100, int(35 + (load_ratio - 1.0) * 80 + temp_offset * 2.5))
    if scenario.eco_pulse:
        thermal_stress = max(10, thermal_stress - 12)
    if scenario.chiller_pre_cool:
        thermal_stress = max(10, thermal_stress - 15)

    if daily_projected < 25:
        esg_rating = "A+ (Zero-Emission Leader)"
        esg_badge = "success"
    elif daily_projected < 40:
        esg_rating = "A (Compliant)"
        esg_badge = "success"
    elif daily_projected <= CARBON_BUDGET:
        esg_rating = "B (Budget Threshold)"
        esg_badge = "warning"
    else:
        esg_rating = "F (Limit Breach Risk)"
        esg_badge = "danger"

    shift_cost = round(power_kw * 8 * 0.18, 2)
    carbon_tax_avoided = round((renew_ratio * power_kw * 8 * EMISSION_FACTOR / 1000.0) * 85.0, 2)

    return {
        "scenario": scenario.dict(),
        "projected_power_kw": power_kw,
        "projected_carbon_rate": carbon_rate,
        "projected_shift_carbon": daily_projected,
        "equipment_stress_percent": thermal_stress,
        "esg_rating": esg_rating,
        "esg_badge": esg_badge,
        "shift_cost_usd": shift_cost,
        "carbon_tax_avoided_usd": carbon_tax_avoided,
        "budget_exceeded": daily_projected > CARBON_BUDGET
    }


@app.post("/api/simulation/apply")
def apply_simulation(scenario: SimulationScenario):
    """
    Applies the simulated scenario directly to the live Digital Twin floor.
    """
    calc = calculate_simulation(scenario)
    state["telemetry"]["power"] = calc["projected_power_kw"]
    state["telemetry"]["carbon"] = calc["projected_carbon_rate"]
    state["telemetry"]["remaining"] = round(CARBON_BUDGET - calc["projected_carbon_rate"], 2)
    state["telemetry"]["temp"] = round(32.0 + scenario.ambient_temp_offset + (scenario.factory_load - 100) * 0.15, 1)

    for m in state["machines"]:
        if m["id"] == 5:
            continue
        new_load = int(scenario.factory_load * (0.8 if m["id"] == 4 else 0.95))
        m["load"] = min(100, max(20, new_load))
        if calc["equipment_stress_percent"] > 80 and m["id"] in [2, 3]:
            m["status"] = "danger" if m["id"] == 3 else "warning"
            m["temp"] = 85 if m["id"] == 3 else 76
        elif calc["equipment_stress_percent"] < 50:
            m["status"] = "online"
            m["temp"] = 48 if m["id"] == 3 else 44
            m["vibr"] = "Normal"

    return {
        "status": "success",
        "message": f"Simulated scenario applied: Load {scenario.factory_load}%, Renewable {scenario.renewable_mix}%",
        "telemetry": state["telemetry"],
        "calc": calc
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

    # Action: Emergency Stop / E-Stop
    if any(k in user_msg for k in ["e-stop", "estop", "emergency stop", "safe stop", "shut down all", "stop all machines", "emergency shutdown"]):
        for m in state["machines"]:
            m["load"] = 0
            m["status"] = "offline"
            m["vibr"] = "Off"
            m["temp"] = min(m.get("temp", 30.0), 30.0)
        state["telemetry"]["power"] = 3.2
        state["telemetry"]["carbon"] = round(3.2 * EMISSION_FACTOR, 2)
        state["telemetry"]["remaining"] = round(CARBON_BUDGET - state["telemetry"]["carbon"], 2)
        return {
            "reply": (
                "⛔ **PLANT-WIDE EMERGENCY SAFE STOP (E-STOP) EXECUTED!**\n\n"
                "- **All Machines:** Drives isolated, mechanical load dropped to **0%**, vibration **Off**.\n"
                "- **Facility Power:** Reduced to **3.2 kWh** (Emergency auxiliary circuits only).\n"
                "- **Lockout/Tagout (LOTO):** Ready for physical maintenance inspection.\n\n"
                "All operational risk has been neutralized."
            ),
            "suggested_action": "navigate_twin"
        }

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

    # 13. What-If Studio & Scenario Simulation
    if any(k in user_msg for k in ["what if", "simulation", "sandbox", "scenario", "stress test"]):
        return {
            "reply": (
                "🧪 **EcoSync What-If Simulation Studio:**\n\n"
                "Our Digital Sandbox allows plant engineers to stress-test scenarios before altering physical equipment:\n"
                "- **Factory Production Load:** Scale from 50% to 150% throughput.\n"
                "- **Renewable Penetration:** Simulate 0% to 100% rooftop solar / battery integration.\n"
                "- **Ambient Heatwave Offset:** Model factory resilience under +15°C summer heatwaves.\n"
                "- **Eco-Pulse & Pre-Cooling:** Test inverter harmonics and secondary chiller savings.\n\n"
                "You can also click **'Apply Scenario to Live Twin'** to preview the operational state on the real factory floor!"
            ),
            "suggested_action": "navigate_simulation"
        }

    # 14. Renewable Microgrid & Solar BESS Storage
    if any(k in user_msg for k in ["solar", "microgrid", "bess", "battery", "renewable", "photovoltaic", "energy storage"]):
        mg = state.get("microgrid", {})
        return {
            "reply": (
                "☀️ **Renewable Microgrid & BESS Storage Status:**\n\n"
                f"- **Rooftop Solar Array:** Generating **{mg.get('solar_kw', 8.6)} kW** (92.4% irradiance efficiency).\n"
                f"- **BESS Battery Storage:** **{mg.get('bess_soc', 76.0)}%** state of charge ({mg.get('bess_current_kwh', 45.6)} / {mg.get('bess_capacity_kwh', 60.0)} kWh).\n"
                f"- **Dynamic Flow:** Discharging **{abs(mg.get('bess_flow_kw', 2.8))} kW** to shave municipal peak demand tariff.\n"
                f"- **Grid Offset Today:** **{mg.get('avoided_co2_kg', 18.4)} kg CO₂** avoided (~{mg.get('equivalent_trees', 7.2)} trees equivalent).\n\n"
                "Switch modes between *Auto Peak Shaving*, *100% Solar Priority*, and *Battery Reserve* directly on the dashboard."
            ),
            "suggested_action": "navigate_overview"
        }

    # 15. Maintenance Work Orders & Dispatch
    if any(k in user_msg for k in ["work order", "dispatch", "maintenance ticket", "technician order", "loto"]):
        wos = state.get("work_orders", [])
        return {
            "reply": (
                "📋 **Maintenance Work Order & Dispatch System:**\n\n"
                f"There are currently **{len(wos)} active work orders** dispatched across factory bays:\n"
                "- **WO-2026-0894 (Critical):** Machine 3 - Spindle thermal runaway & glycol flush. Assigned to Marcus Vance.\n"
                "- **WO-2026-0889 (High):** Machine 2 - 142 Hz harmonic vibration & spool replacement. Assigned to Elena Rostova.\n\n"
                "You can inspect any machine on the 2.5D floor map and click **'Dispatch Work Order'** to generate a complete LOTO checklist ticket with barcode!"
            ),
            "suggested_action": "navigate_alerts"
        }

    # 16. 2.5D Factory Floor Map & Machine Diagnostics
    if any(k in user_msg for k in ["floor map", "2.5d", "layout", "aisle", "diagnostic", "fft", "heatmap", "rul"]):
        return {
            "reply": (
                "🏢 **2.5D Factory Floor Map & Machine Diagnostics:**\n\n"
                "EcoSync provides an interactive schematic layout of the entire facility:\n"
                "- **Zone A:** Precision CNC Machining (Machine 1)\n"
                "- **Zone B:** Heavy Forming & Molding (Machine 2 & Machine 3)\n"
                "- **Zone C:** Robotic Assembly & Welding (Machine 4 & Machine 5)\n"
                "- **Diagnostics Drawer:** Click any machine to view real-time **Thermal Heatmaps**, live **FFT Vibration Spectrum (142 Hz)**, and **Remaining Useful Life (RUL)** prognostics."
            ),
            "suggested_action": "navigate_twin"
        }

    # 17. Fleet Admin & Company Growth Journey
    if any(k in user_msg for k in ["admin", "company journey", "scale machine", "increase machine", "add machine", "growth milestone", "fleet scaling", "expand factory"]):
        count = len(state["machines"])
        return {
            "reply": (
                "🚀 **Company Scaling Journey & Fleet Administration:**\n\n"
                f"EcoSync supports dynamic factory floor expansion as your company progresses through its industrial roadmap. Current active fleet: **{count} machines**.\n\n"
                "- **Phase 1: Seed Prototype** (2 Machines: Lathe + Assembly) -> *Completed*\n"
                "- **Phase 2: Pilot Plant** (5 Machines: Lathe, Press, Molder, Robot, Welder) -> *Active Current Phase*\n"
                "- **Phase 3: Commercial Growth** (8 Machines: +Precision Laser Cutter, +Clean Heat Pump, +Eco Extruder)\n"
                "- **Phase 4: Megafactory Zero-Carbon** (12 Machines: +Additive 3D Metal Printer, +Autonomous AMR Fleet, +Clean Induction Furnace, +Automated QA Gantry)\n\n"
                "Visit the **Fleet Admin** page to deploy expansion bundles or add custom machines with 1-click!"
            ),
            "suggested_action": "navigate_admin"
        }

    # 18. Strict Scope Boundary - If outside EcoSync
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
