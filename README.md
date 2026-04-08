# Patient Health Monitor — IoT System

Real-time patient vitals monitoring using ESP32 + MAX30102 + DS18B20, FastAPI backend, and React dashboard.

---

## System Overview

```
ESP32 (sensors) --> FastAPI Backend --> PostgreSQL --> React Dashboard
```

---

## For the ESP32 Hardware Setup (Friend's Side)

### 1. Wire the Circuit

**MAX30102 → ESP32**
| MAX30102 | ESP32 |
|----------|-------|
| VIN | 3.3V |
| GND | GND |
| SDA | GPIO 21 |
| SCL | GPIO 22 |

**DS18B20 → ESP32**
| DS18B20 | ESP32 |
|---------|-------|
| VCC | 3.3V |
| GND | GND |
| DATA | GPIO 4 |

> Put a **4.7kΩ resistor** between DS18B20 DATA and VCC pin.

---

### 2. Install PlatformIO

Install VS Code → install PlatformIO extension from marketplace.

Or install CLI:
```bash
pip install platformio
```

---

### 3. Configure the Firmware

Open `firmware/src/main.cpp` and edit these 3 lines:

```cpp
const char* WIFI_SSID    = "YOUR_WIFI_NAME";
const char* WIFI_PASS    = "YOUR_WIFI_PASSWORD";
const char* API_ENDPOINT = "http://BACKEND_IP:8000/api/vitals/";
```

Replace `BACKEND_IP` with the IP address of the PC running the backend.

---

### 4. Flash the ESP32

Connect ESP32 via USB, then run:

```bash
cd firmware
pio run --target upload
```

### 5. Monitor Serial Output

```bash
pio device monitor
```

You should see:
```
WiFi connected: 192.168.x.x
HR: 72 bpm | SpO2: 98% | Temp: 36.50 C
POST http://... -> HTTP 201
```

---

## Backend Setup (Server Side)

### Requirements
- Python 3.10+
- PostgreSQL running

### 1. Create Database

```bash
sudo -u postgres psql -c "CREATE DATABASE health_monitor;"
sudo -u postgres psql -c "CREATE USER health_user WITH PASSWORD 'health_pass123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE health_monitor TO health_user;"
sudo -u postgres psql -c "ALTER DATABASE health_monitor OWNER TO health_user;"
```

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Create Tables

```bash
python3 -c "from app.db.database import Base, engine; from app.models.vitals import Vital; Base.metadata.create_all(engine); print('Tables created')"
```

### 4. Start Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: `http://localhost:8000/docs`

---

## Frontend Setup (Dashboard)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Dashboard

```bash
npm run dev
```

Open browser at: `http://localhost:5173`

---

## Running Everything Together

| Terminal | Command |
|----------|---------|
| 1 | `cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` |
| 2 | `cd frontend && npm run dev` |
| 3 | ESP32 flashed and powered on |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vitals/` | ESP32 sends sensor data |
| GET | `/api/vitals/{patient_id}` | Get reading history |
| GET | `/api/vitals/latest?patient_id=1` | Get latest reading |

### Test without ESP32

```bash
curl -X POST http://localhost:8000/api/vitals/ \
  -H 'Content-Type: application/json' \
  -d '{"patient_id":1,"heart_rate":75,"spo2":98,"temperature":36.5}'
```
