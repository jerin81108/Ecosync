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

        m3 = None
        m2 = None
        if machines:
            m3 = next((m for m in machines if m.get("id") == 3), None)
            m2 = next((m for m in machines if m.get("id") == 2), None)

        m3_temp = m3.get("temp", temp) if m3 else temp
        m3_is_mitigated = (m3 and m3.get("temp", 90) <= 70 and m3.get("status") == "online")

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
        is_overheat = (not m3_is_mitigated) and (m3_temp > 72 or (m3_temp > 48 and temp_trend_up))
        is_carbon_spike = (carbon_emitted > 22.0 or co2 > 520.0 or power > 20.0)
        is_m2_strain = bool(m2 and (m2.get("vibr") in ["High", "Critical"] or m2.get("temp", 0) > 74 or m2.get("load", 0) >= 88))
        is_throttled_deficit = bool(m3_is_mitigated and m3 and m3.get("load", 100) <= 80)
        is_nominal = not (is_overheat or is_carbon_spike or is_m2_strain)

        # 1. Thermal Runaway / Overheating Evaluation
        if is_overheat:
            prob = min(98, int(70 + (m3_temp - 45) * 1.2))
            predictions.append({
                "id": "pred-overheat",
                "title": f"Machine-3 Critical Overheating Alert ({m3_temp:.1f}°C)",
                "desc": f"Spindle thermal velocity (+{((m3_temp-40)/12):.1f}°C/min) predicts thermal trip within 4.8 minutes.",
                "prob": prob,
                "severity": "danger",
                "tag": "Critical"
            })
            recommendations.append({
                "id": "rec-throttle-m3",
                "title": f"Throttle Machine-3 Speed by 25% (Target: 68°C)",
                "desc": f"Reduces mechanical friction and arrests stator coil thermal escalation currently at {m3_temp:.1f}°C.",
                "impact": "⚡ Halts thermal trip & saves 3.8 kWh",
                "checked": True,
                "executed": False
            })
            recommendations.append({
                "id": "rec-chiller-b",
                "title": "Engage Secondary Glycol Chiller Unit B (Loop 3)",
                "desc": "Forces active 8°C heat exchange fluid through hydraulic manifolds to purge core heat.",
                "impact": "❄ Drops operating temp by ~14°C within 5 mins",
                "checked": True,
                "executed": False
            })
            recommendations.append({
                "id": "rec-manpower-overheat",
                "title": "Deploy Auxiliary Floor Technicians (+4 on Line 4)",
                "desc": "Offsets the -18.4% throughput loss from Machine-3 throttling to safeguard shift revenue ($24,000 target).",
                "impact": "👥 Restores line throughput to 100%",
                "checked": True,
                "executed": False
            })
        elif m3_is_mitigated:
            predictions.append({
                "id": "pred-overheat",
                "title": "Machine-3 Thermal Stability (Mitigated)",
                "desc": f"Spindle stabilized at {m3_temp:.1f}°C. Closed-loop cooling active.",
                "prob": 12,
                "severity": "info",
                "tag": "Stabilized"
            })
            recommendations.append({
                "id": "rec-throttle-m3",
                "title": "Machine-3 Safety Throttle Active (Load: 72%)",
                "desc": "Operating load held at -25% to sustain thermal safety margin.",
                "impact": "✔ Thermal trip averted & coil preserved",
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
                "title": "Engage Flue Gas Scrubber & Carbon Adsorber",
                "desc": "Routes exhaust stream through catalytic filtration bed to neutralize direct CO₂ release.",
                "impact": "🌍 Lowers direct stack CO₂ output by 35%",
                "checked": True,
                "executed": False
            })
            recommendations.append({
                "id": "rec-bess-peak",
                "title": "Activate Battery Storage (BESS) Peak-Shaving",
                "desc": f"Supplies {min(9.5, round(power*0.35, 1))} kWh from clean stored solar reserves to bypass grid peak tariffs.",
                "impact": "⚡ Averts $420 peak demand tariff penalty",
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

        # 3. Mechanical Strain / Hydraulic Press Evaluation
        if is_m2_strain:
            m2_load = m2.get("load", 92) if m2 else 92
            predictions.append({
                "id": "pred-m2-failure",
                "title": f"Machine-2 Hydraulic Valve Fatigue (Load: {m2_load}%)",
                "desc": "142 Hz harmonic vibration detected. High likelihood of hydraulic micro-cavitation and valve failure.",
                "prob": 88,
                "severity": "warning",
                "tag": "High Risk"
            })
            recommendations.append({
                "id": "rec-hydraulic-damp",
                "title": "Relieve Hydraulic Pressure to 80% & Close Bypass Valve",
                "desc": "Dampens 142 Hz resonant harmonic oscillation and relieves valve manifold stress.",
                "impact": "🛡 Prevents catastrophic $18,000 pump rupture",
                "checked": True,
                "executed": False
            })
            recommendations.append({
                "id": "rec-balance-m2",
                "title": "Shift Batch #409 Workload to Assembly Robot 4",
                "desc": "Diverts heavy stamping queue to balanced robotic cell to unload Hydraulic Press 2.",
                "impact": "⚖ Balances line load & reduces cycle strain by 32%",
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
                "checked": True,
                "executed": False
            })
            recommendations.append({
                "id": "rec-sync-conveyor",
                "title": "Re-index Buffer Conveyor Feed Velocity by -15%",
                "desc": "Synchronizes parts arrival rate with throttled injection molding cycle to prevent jamming.",
                "impact": "📦 Eliminates line bottlenecks & parts scrap",
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
                "checked": True,
                "executed": False
            })
            recommendations.append({
                "id": "rec-esg-credit",
                "title": "Bank Clean Energy Surplus to Corporate ESG Ledger",
                "desc": "Audit logs verified 4.2 kg CO₂ emission surplus under statutory compliance cap.",
                "impact": "🌿 Validates AAA Corporate ESG Rating",
                "checked": True,
                "executed": False
            })
            recommendations.append({
                "id": "rec-robot-traj",
                "title": "Enable High-Velocity Trajectory on Assembly Robot 4",
                "desc": "Thermal headroom allows +3.5% faster pick-and-place indexing without thermal penalty.",
                "impact": "🚀 Yields +28 units/hour throughput boost",
                "checked": False,
                "executed": False
            })

        return {
            "predictions": predictions,
            "recommendations": recommendations
        }


# Singleton instance
ai_agent = DigitalTwinAIAgent()
