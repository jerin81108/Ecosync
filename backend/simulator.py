"""
EcoSync Sensor Simulator
Generates continuous realistic factory sensor data for hackathon demonstrations.
Can simulate:
- Normal operating conditions
- Gradual temperature rise (Overheat scenario)
- Carbon emission spike
- Power surges
"""

import time
import random
import requests
import sys

API_URL = "http://localhost:8000/api/sensor-data"

def run_simulation(scenario: str = "gradual_overheat"):
    print("=" * 60)
    print(" 🏭 ECOSYNC SENSOR SIMULATOR ACTIVE")
    print(f" Target Endpoint: {API_URL}")
    print(f" Scenario: {scenario.upper()}")
    print("=" * 60)

    co2 = 420.0
    temp = 36.0
    humidity = 60.0
    power = 15.0

    step = 0
    while True:
        step += 1

        if scenario == "gradual_overheat":
            # Simulate Machine 3 overheating scenario
            # 65 -> 70 -> 75 -> 80 -> 89°C over time
            temp += random.uniform(0.3, 0.8)
            power += random.uniform(0.1, 0.4)
            co2 += random.uniform(1.0, 3.5)
            humidity += random.uniform(-0.2, 0.2)
        elif scenario == "spike":
            # Sudden carbon emission spike
            co2 += random.uniform(5.0, 15.0)
            power += random.uniform(0.5, 1.2)
            temp += random.uniform(0.2, 0.5)
        else:
            # Nominal steady state
            co2 += random.uniform(-2.0, 2.0)
            temp += random.uniform(-0.2, 0.2)
            power += random.uniform(-0.2, 0.2)
            humidity += random.uniform(-0.3, 0.3)

        # Bounds
        co2 = max(380.0, min(800.0, co2))
        temp = max(25.0, min(95.0, temp))
        power = max(10.0, min(30.0, power))
        humidity = max(35.0, min(85.0, humidity))

        payload = {
            "co2": round(co2, 1),
            "temp": round(temp, 1),
            "humidity": round(humidity, 1),
            "power": round(power, 2),
            "machine_id": 3,
            "vibration": "Critical" if temp > 80 else "High" if temp > 70 else "Normal"
        }

        try:
            res = requests.post(API_URL, json=payload, timeout=2.0)
            if res.status_code == 200:
                calc = res.json().get("carbon_calculated", 0)
                print(f"[Tick #{step}] CO₂: {co2:.1f} ppm | Temp: {temp:.1f}°C | Power: {power:.2f} kWh -> Carbon: {calc} kg CO₂")
            else:
                print(f"[Tick #{step}] Server response: {res.status_code}")
        except Exception as e:
            print(f"[Tick #{step}] Backend not connected yet ({e.__class__.__name__}). Generating telemetry locally...")

        time.sleep(3)


if __name__ == "__main__":
    scenario = sys.argv[1] if len(sys.argv) > 1 else "gradual_overheat"
    run_simulation(scenario)
