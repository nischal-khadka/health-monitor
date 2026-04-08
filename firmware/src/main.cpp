#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include "spo2_algorithm.h"
#include <OneWire.h>
#include <DallasTemperature.h>

// ─── Config ──────────────────────────────────────────────────────────────────
const char* WIFI_SSID     = "YOUR_SSID";
const char* WIFI_PASS     = "YOUR_PASSWORD";
const char* API_ENDPOINT  = "http://YOUR_BACKEND_IP:8000/api/vitals";
const int   PATIENT_ID    = 1;

// ─── Pin Definitions ─────────────────────────────────────────────────────────
#define DS18B20_PIN 4    // DS18B20 data pin (1-Wire)
#define SDA_PIN     21   // MAX30102 I2C SDA
#define SCL_PIN     22   // MAX30102 I2C SCL

// ─── Sensor Objects ──────────────────────────────────────────────────────────
MAX30105 particleSensor;
OneWire oneWire(DS18B20_PIN);
DallasTemperature tempSensor(&oneWire);

// ─── SpO2 / HR buffers ───────────────────────────────────────────────────────
const byte    RATE_SIZE = 4;
byte          rates[RATE_SIZE];
byte          rateSpot = 0;
long          lastBeat = 0;
float         beatsPerMinute;
int           beatAvg;

uint32_t      irBuffer[100];
uint32_t      redBuffer[100];
int32_t       spo2;
int8_t        validSPO2;
int32_t       heartRate;
int8_t        validHeartRate;

void connectWiFi() {
    Serial.print("Connecting to WiFi");
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected: " + WiFi.localIP().toString());
}

void sendData(float temp, int hr, int spo2Val) {
    if (WiFi.status() != WL_CONNECTED) {
        connectWiFi();
        return;
    }

    HTTPClient http;
    http.begin(API_ENDPOINT);
    http.addHeader("Content-Type", "application/json");

    JsonDocument doc;
    doc["patient_id"]   = PATIENT_ID;
    doc["heart_rate"]   = hr;
    doc["spo2"]         = spo2Val;
    doc["temperature"]  = temp;

    String body;
    serializeJson(doc, body);

    int code = http.POST(body);
    Serial.printf("POST %s -> HTTP %d\n", API_ENDPOINT, code);
    http.end();
}

void setup() {
    Serial.begin(115200);
    Wire.begin(SDA_PIN, SCL_PIN);

    // MAX30102 init
    if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
        Serial.println("MAX30102 not found! Check wiring.");
        while (1);
    }
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);

    // DS18B20 init
    tempSensor.begin();

    connectWiFi();
    Serial.println("Setup complete.");
}

void loop() {
    // ── Collect 100 samples for SpO2 ────────────────────────────────────────
    for (byte i = 0; i < 100; i++) {
        while (!particleSensor.available())
            particleSensor.check();

        redBuffer[i] = particleSensor.getRed();
        irBuffer[i]  = particleSensor.getIR();
        particleSensor.nextSample();
    }

    maxim_heart_rate_and_oxygen_saturation(
        irBuffer, 100, redBuffer,
        &spo2, &validSPO2, &heartRate, &validHeartRate
    );

    // ── Temperature ─────────────────────────────────────────────────────────
    tempSensor.requestTemperatures();
    float tempC = tempSensor.getTempCByIndex(0);

    int hrVal   = validHeartRate ? (int)heartRate : 0;
    int spo2Val = validSPO2      ? (int)spo2      : 0;

    Serial.printf("HR: %d bpm | SpO2: %d%% | Temp: %.2f C\n", hrVal, spo2Val, tempC);

    sendData(tempC, hrVal, spo2Val);
    delay(5000);  // send every 5 seconds
}
