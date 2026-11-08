"""
EcoSync AI Prediction & Optimization Engine
Simulates and executes industrial Digital Twin predictive intelligence:
- Real-time Trend Analysis (Temperature drift, Carbon accumulation, Power surges)
- Failure Probability Estimation
- Actionable Carbon Reduction & Machine Safeguard Recommendations
"""

from typing import List, Dict, Any


class DigitalTwinAIAgent:
    def __init__(self):
        self.history_window: List[Dict[str, float]] = []
        self.max_window = 30

    def record_reading(self, reading: Dict[str, float]):
        self.history_window.append(reading)
        if len(self.history_window) > self.max_window:
            self.history_window.pop(0)

    def analyze_and_predict(self, current: Dict[str, Any], machines: Any = None) -> Dict[str, Any]:
        """
        Analyzes live telemetry trend against physical safety models
        and produces dynamic, non-repetitive probabilities and recommendations.
        """
        temp = current.get("temp", 36.0)
        co2 = current.get("co2", 420.0)
        power = current.get("power", 15.0)
        carbon_emitted = current.get("carbon", round(power * 0.82, 2))

        # Identify any problem machine dynamically from the fleet
        problem_machine = None
        strain_machine = None
        if machines:
            # Overheating / Danger machine
            problem_machine = next((m for m in machines if m.get("status") == "danger" or m.get("temp", 0) > 72), None)
            # Vibration / Hydraulic Strain machine
            strain_machine = next((m for m in machines if m != problem_machine and (m.get("status") == "warning" or m.get("vibr") in ["High", "Critical"] or m.get("load", 0) >= 88)), None)

        p_name = problem_machine.get("name", "Machine 3") if problem_machine else "Machine 3"
        p_id = problem_machine.get("id", 3) if problem_machine else 3
        p_type = problem_machine.get("type", "Injection Molder") if problem_machine else "Injection Molder"
        p_bay = problem_machine.get("bay", f"Bay {p_id}") if problem_machine else "Bay 3"
        p_temp = problem_machine.get("temp", temp) if problem_machine else temp
        p_is_mitigated = bool(problem_machine and problem_machine.get("temp", 90) <= 70 and problem_machine.get("status") == "online")

        s_name = strain_machine.get("name", "Machine 2") if strain_machine else "Machine 2"
        s_id = strain_machine.get("id", 2) if strain_machine else 2
        s_type = strain_machine.get("type", "Hydraulic Press") if strain_machine else "Hydraulic Press"

        # Baseline predictions
        predictions = []
        recommendations = []

        # 1. Thermal Runaway Prediction
        temp_trend_up = False
        if len(self.history_window) >= 3:
            recent_temps = [r.get("temp", 36.0) for r in self.history_window[-3:]]
            if recent_temps[-1] > recent_temps[0]:
                temp_trend_up = True

        # Determine active situations
        is_overheat = bool(problem_machine and not p_is_mitigated and (p_temp > 70 or (p_temp > 48 and temp_trend_up)))
        is_carbon_spike = bool(carbon_emitted > 22.0 or co2 > 520.0 or power > 20.0)
        is_m2_strain = bool(strain_machine and (strain_machine.get("vibr") in ["High", "Critical"] or strain_machine.get("temp", 0) > 74 or strain_machine.get("load", 0) >= 88))
        is_throttled_deficit = bool(p_is_mitigated and problem_machine and problem_machine.get("load", 100) <= 80)
        is_nominal = not (is_overheat or is_carbon_spike or is_m2_strain)

        # 1. Thermal Runaway / Overheating Evaluation
        if is_overheat:
            prob = min(98, int(70 + (p_temp - 45) * 1.2))
            predictions.append({
                "id": "pred-overheat",
                "title": f"{p_name} Critical Overheating Alert ({p_temp:.1f}°C)",
                "desc": f"Spindle thermal velocity on {p_type} predicts thermal trip within 4.8 minutes.",
                "prob": prob,
                "severity": "danger",
                "tag": "Critical"
            })
            recommendations.append({
                "id": f"rec-throttle-m{p_id}",
                "title": f"Throttle {p_name} Speed by 25% (Target: 44°C)",
                "desc": f"Reduces mechanical friction and arrests thermal escalation on {p_type} in {p_bay} currently at {p_temp:.1f}°C.",
                "impact": f"⚡ Halts {p_name} thermal trip & saves 3.8 kWh",
                "production_loss": "-18.4% throughput (~160 units/hr)",
                "revenue_loss": "-$3,850 / shift deficit",
                "workers_needed": 4,
                "worker_action": f"Deploy 4 Auxiliary Technicians on {p_bay} line to manually compensate throughput drop",
                "worker_cost": "$1,200 / shift",
                "damage_averted": "+$45,000 catastrophic stator burnout averted",
                "net_benefit": "+$39,950 net shift protection",
                "checked": True,
                "executed": False
            })
            recommendations.append({
                "id": f"rec-chiller-m{p_id}",
                "title": f"Engage Secondary Glycol Chiller for {p_name}",
                "desc": f"Forces active 8°C heat exchange fluid through {p_type} manifolds to purge core heat.",
                "impact": "❄ Drops operating temp by ~14°C within 5 mins",
                "production_loss": "-3.5% auxiliary thermal draw",
                "revenue_loss": "-$480 / shift coolant & power cost",
                "workers_needed": 1,
                "worker_action": "Assign 1 HVAC maintenance technician to monitor Glycol loop pressure",
                "worker_cost": "$300 / shift",
                "damage_averted": "+$18,000 manifold seal failure averted",
                "net_benefit": "+$17,220 net protection",
                "checked": True,
                "executed": False
            })
            recommendations.append({
                "id": "rec-manpower-overheat",
                "title": f"Deploy Auxiliary Floor Technicians (+4 on {p_bay})",
                "desc": f"Offsets the -18.4% throughput loss from {p_name} throttling to safeguard shift revenue ($24,000 target).",
                "impact": "👥 Restores line throughput to 100%",
                "production_loss": "0.0% (Compensates for -18.4% deficit)",
                "revenue_loss": "$0 (Secures $24,000 daily quota)",
                "workers_needed": 4,
                "worker_action": "Execute manual buffer transfer & finishing line pacing",
                "worker_cost": "$1,200 / shift",
                "damage_averted": "+$24,000 full shift revenue commitment secured",
                "net_benefit": "+$22,800 net revenue retained",
                "checked": True,
                "executed": False
            })
        elif p_is_mitigated:
            predictions.append({
                "id": "pred-overheat",
                "title": f"{p_name} Thermal Stability (Mitigated)",
                "desc": f"{p_type} spindle stabilized at {p_temp:.1f}°C. Closed-loop cooling active.",
                "prob": 12,
                "severity": "info",
                "tag": "Stabilized"
            })
            recommendations.append({
                "id": f"rec-throttle-m{p_id}",
                "title": f"{p_name} Safety Throttle Active (Load: 68%)",
                "desc": f"Operating load held at safe cadence to sustain thermal safety margin.",
                "impact": "✔ Thermal trip averted & coil preserved",
                "production_loss": "-18.4% without auxiliary workforce",
                "revenue_loss": "-$3,850 if uncompensated",
                "workers_needed": 4,
                "worker_action": "Maintain auxiliary workforce until full batch cooldown",
                "worker_cost": "$1,200 / shift",
                "damage_averted": "+$45,000 equipment damage prevented",
                "net_benefit": "+$39,950 net savings",
                "checked": True,
                "executed": True
            })

        # 2. Carbon & Energy Surge Evaluation
        if is_carbon_spike:
            carbon_prob = min(96, int(65 + (carbon_emitted / 50.0) * 32))
            predictions.append({
                "id": "pred-carbon",
                "title": f"Carbon Limit Breach Hazard ({carbon_emitted:.1f} kg CO₂)",
                "desc": f"Power draw ({power:.1f} kWh) will exceed daily 50 kg threshold in 24 minutes without intervention.",
                "prob": carbon_prob,
                "severity": "danger" if carbon_prob > 80 else "warning",
                "tag": "Critical" if carbon_prob > 80 else "High"
            })
            recommendations.append({
                "id": "rec-scrubber",
                "title": "Turn On Carbon Scrubber Filter",
                "desc": "Cleans chimney smoke to instantly lower carbon emissions.",
                "impact": "🌍 Cuts factory CO₂ emissions by 35%",
                "production_loss": "Minor 2% conveyor power drop",
                "revenue_loss": "-$200 / shift filter cost",
                "workers_needed": 1,
                "worker_action": "1 technician to inspect filter cartridge",
                "worker_cost": "$250 / shift",
                "damage_averted": "+$14,500 pollution fine avoided",
                "net_benefit": "+$14,050 clean savings",
                "checked": True,
                "executed": False
            })
            recommendations.append({
                "id": "rec-bess-peak",
                "title": "Switch to Clean Solar Battery Power",
                "desc": "Runs machines on stored rooftop solar energy instead of dirty grid power.",
                "impact": "⚡ Saves 5.2 kWh & stops carbon limit breach",
                "production_loss": "0% throughput loss (seamless)",
                "revenue_loss": "$0 / shift",
                "workers_needed": 0,
                "worker_action": "Automated clean power switch (no manual labor)",
                "worker_cost": "$0",
                "damage_averted": "+$4,800 peak tariff fine avoided",
                "net_benefit": "+$4,800 net savings",
                "checked": True,
                "executed": False
            })
        else:
            predictions.append({
                "id": "pred-carbon",
                "title": "Carbon Budget Velocity Normal",
                "desc": f"Cumulative output: {carbon_emitted:.1f} kg CO₂ / 50 kg daily budget. Safety margin preserved.",
                "prob": 24,
                "severity": "info",
                "tag": "Nominal"
            })

        # 3. Mechanical Strain / Vibration Evaluation
        if is_m2_strain:
            s_load = strain_machine.get("load", 92) if strain_machine else 92
            predictions.append({
                "id": "pred-m2-failure",
                "title": f"{s_name} Mechanical Stress Alert (Load: {s_load}%)",
                "desc": f"Resonant harmonic vibration detected on {s_type}. High likelihood of mechanical micro-cavitation and valve failure.",
                "prob": 88,
                "severity": "warning",
                "tag": "High Risk"
            })
            recommendations.append({
                "id": f"rec-damp-m{s_id}",
                "title": f"Relieve Mechanical Stress on {s_name} (Cadence: 75%)",
                "desc": f"Dampens resonant harmonic oscillation and relieves component stress on {s_type}.",
                "impact": f"🛡 Prevents catastrophic {s_name} equipment damage",
                "production_loss": "-8.0% cycle tempo",
                "revenue_loss": "-$1,450 / shift throughput delay",
                "workers_needed": 2,
                "worker_action": f"Assign 2 Tooling Technicians to oversee {s_name} calibration",
                "worker_cost": "$550 / shift",
                "damage_averted": "+$28,000 cylinder blow-out & die cracking averted",
                "net_benefit": "+$26,000 net protection",
                "checked": True,
                "executed": False
            })
            recommendations.append({
                "id": f"rec-balance-m{s_id}",
                "title": f"Shift {s_name} Workload to Alternate Line Cells",
                "desc": f"Diverts heavy processing queue to balanced automated cells to unload {s_name}.",
                "impact": "⚖ Balances line load & reduces cycle strain by 32%",
                "production_loss": "-2.5% during staging transfer",
                "revenue_loss": "-$380 staging handling",
                "workers_needed": 2,
                "worker_action": "Deploy 2 Material Logistics Handlers to re-route blank pallet feeds",
                "worker_cost": "$450 / shift",
                "damage_averted": "+$12,500 assembly stoppage averted",
                "net_benefit": "+$11,670 net savings",
                "checked": True,
                "executed": False
            })
        else:
            predictions.append({
                "id": "pred-m2-failure",
                "title": "Mechanical Fleet Acoustic Baseline",
                "desc": "Vibration harmonics across all spindles within ISO 10816 Class II vibration tolerance.",
                "prob": 18,
                "severity": "info",
                "tag": "Healthy"
            })

        # 4. Capacity Deficit / Revenue Protection Situation
        if is_throttled_deficit:
            recommendations.append({
                "id": "rec-manpower-quota",
                "title": "Authorize Floor Technicians (+4) for Manual Finishing",
                "desc": "Restores the 18.4% capacity deficit caused by Machine-3 thermal protection.",
                "impact": "💰 Fully secures $24,000 daily shift revenue",
                "production_loss": "0.0% (Deficit fully mitigated)",
                "revenue_loss": "$0 deficit ($24k quota achieved)",
                "workers_needed": 4,
                "worker_action": "Immediate manual buffer transfer & line pacing",
                "worker_cost": "$1,200 / shift",
                "damage_averted": "+$24,000 shift revenue preserved",
                "net_benefit": "+$22,800 net revenue",
                "checked": True,
                "executed": False
            })
            recommendations.append({
                "id": "rec-sync-conveyor",
                "title": "Re-index Buffer Conveyor Feed Velocity by -15%",
                "desc": "Synchronizes parts arrival rate with throttled injection molding cycle to prevent jamming.",
                "impact": "📦 Eliminates line bottlenecks & parts scrap",
                "production_loss": "-1.5% feed index delay",
                "revenue_loss": "-$180 indexing friction",
                "workers_needed": 1,
                "worker_action": "Assign 1 Conveyor Specialist to calibrate optical line sensors",
                "worker_cost": "$220 / shift",
                "damage_averted": "+$7,800 parts jamming damage averted",
                "net_benefit": "+$7,400 net protection",
                "checked": True,
                "executed": False
            })

        # 5. Nominal Situation Optimizations (when clean & safe)
        if is_nominal and not is_throttled_deficit:
            recommendations.append({
                "id": "rec-sensor-calib",
                "title": "Initiate Zero-Drift Calibration on Wireless ESP32 Cluster",
                "desc": "Executes baseline offset verification on MQ-135 electrochemical and DHT22 digital nodes.",
                "impact": "🎯 Calibrates sensor drift to ±0.2°C accuracy",
                "production_loss": "0.0% (Zero downtime calibration)",
                "revenue_loss": "$0 / shift",
                "workers_needed": 1,
                "worker_action": "1 QA Instrumentation Specialist for automated IoT verification",
                "worker_cost": "$250 / shift",
                "damage_averted": "+$5,200 false alert stoppage averted",
                "net_benefit": "+$4,950 optimization",
                "checked": True,
                "executed": False
            })
            recommendations.append({
                "id": "rec-esg-credit",
                "title": "Bank Clean Energy Surplus to Corporate ESG Ledger",
                "desc": "Audit logs verified 4.2 kg CO₂ emission surplus under statutory compliance cap.",
                "impact": "🌿 Validates AAA Corporate ESG Rating",
                "production_loss": "0.0% production impact",
                "revenue_loss": "$0 / shift",
                "workers_needed": 1,
                "worker_action": "1 Sustainability Auditor to confirm digital green certificate",
                "worker_cost": "$200 / shift",
                "damage_averted": "+$3,500 carbon tax audit penalty avoided",
                "net_benefit": "+$3,300 corporate credit",
                "checked": True,
                "executed": False
            })
            recommendations.append({
                "id": "rec-robot-traj",
                "title": "Enable High-Velocity Trajectory on Assembly Robot 4",
                "desc": "Thermal headroom allows +3.5% faster pick-and-place indexing without thermal penalty.",
                "impact": "🚀 Yields +28 units/hour throughput boost",
                "production_loss": "+3.5% Throughput Gain",
                "revenue_loss": "+$920 / shift revenue bonus",
                "workers_needed": 1,
                "worker_action": "1 Robotics Engineer on standby for trajectory oversight",
                "worker_cost": "$350 / shift",
                "damage_averted": "$0 (Operating in safe envelope)",
                "net_benefit": "+$570 net profit boost",
                "checked": False,
                "executed": False
            })

        return {
            "predictions": predictions,
            "recommendations": recommendations
        }


# Singleton instance
ai_agent = DigitalTwinAIAgent()
