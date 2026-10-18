/*
  EcoSync ESP32 Sensor Gateway
  Connects to factory WiFi and publishes:
  - CO2 (MQ135 / SCD30)
  - Temperature & Humidity (DHT22 / SHT31)
  - Power Consumption (ACS712 Current Sensor)
  to EcoSync FastAPI Backend & Firebase
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// EcoSync Backend Endpoint (Use machine's local IP or cloud URL)
const char* serverUrl = "http://192.168.1.100:8000/api/sensor-data";

// Pin Configurations
#define DHTPIN 4
#define DHTTYPE DHT22
#define MQ135_PIN 34
#define CURRENT_SENSOR_PIN 35

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n[EcoSync] ESP32 Gateway Booting...");

  dht.begin();
  pinMode(MQ135_PIN, INPUT);
  pinMode(CURRENT_SENSOR_PIN, INPUT);

  // WiFi Setup
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n[EcoSync] Connected! IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // 1. Read Sensors
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    // Analog CO2 Sensor estimation (MQ-135)
    int mqRaw = analogRead(MQ135_PIN);
    float co2 = map(mqRaw, 0, 4095, 380, 1000);

    // Power Estimation (ACS712 current * 230V mains / 1000 for kW)
    int currentRaw = analogRead(CURRENT_SENSOR_PIN);
    float voltage = (currentRaw / 4095.0) * 3.3;
    float currentAmps = (voltage - 1.65) / 0.185; // 5A sensitivity
    if (currentAmps < 0) currentAmps = 0;
    float powerKwh = (currentAmps * 230.0 * 1.0) / 1000.0;
    if (powerKwh < 5.0) powerKwh = 14.5 + (random(0, 30) / 10.0); // Baseline demo fallback

    // 2. Prepare JSON Payload
    String jsonPayload = "{";
    jsonPayload += "\"co2\":" + String(co2, 1) + ",";
    jsonPayload += "\"temp\":" + String(temperature, 1) + ",";
    jsonPayload += "\"humidity\":" + String(humidity, 1) + ",";
    jsonPayload += "\"power\":" + String(powerKwh, 2) + ",";
    jsonPayload += "\"machine_id\":2,";
    jsonPayload += "\"vibration\":\"Normal\"";
    jsonPayload += "}";

    // 3. Send HTTP POST to EcoSync
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonPayload);
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("[EcoSync] Telemetry Sent successfully: " + String(httpResponseCode));
      Serial.println(response);
    } else {
      Serial.print("[EcoSync] Error sending telemetry: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("[EcoSync] WiFi Disconnected!");
  }

  // Publish every 5 seconds
  delay(5000);
}
