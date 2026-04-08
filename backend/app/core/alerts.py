from typing import List

# ── Thresholds ────────────────────────────────────────────────────────────────
HR_LOW_WARN      = 50
HR_HIGH_WARN     = 120
HR_LOW_CRITICAL  = 40
HR_HIGH_CRITICAL = 150

SPO2_WARN        = 95
SPO2_CRITICAL    = 90

TEMP_LOW_WARN    = 35.0
TEMP_HIGH_WARN   = 38.0
TEMP_LOW_CRIT    = 34.0
TEMP_HIGH_CRIT   = 39.0


def check_alerts(heart_rate: int, spo2: int, temperature: float) -> List[dict]:
    alerts = []

    # Heart rate
    if heart_rate <= HR_LOW_CRITICAL or heart_rate >= HR_HIGH_CRITICAL:
        alerts.append({"field": "heart_rate", "level": "critical",
                        "message": f"CRITICAL: Heart rate {heart_rate} bpm is dangerously abnormal"})
    elif heart_rate < HR_LOW_WARN or heart_rate > HR_HIGH_WARN:
        alerts.append({"field": "heart_rate", "level": "warning",
                        "message": f"WARNING: Heart rate {heart_rate} bpm is outside normal range (50–120)"})

    # SpO2
    if spo2 < SPO2_CRITICAL:
        alerts.append({"field": "spo2", "level": "critical",
                        "message": f"CRITICAL: SpO2 {spo2}% — severe oxygen deficiency"})
    elif spo2 < SPO2_WARN:
        alerts.append({"field": "spo2", "level": "warning",
                        "message": f"WARNING: SpO2 {spo2}% is below normal (95%)"})

    # Temperature
    if temperature <= TEMP_LOW_CRIT or temperature >= TEMP_HIGH_CRIT:
        alerts.append({"field": "temperature", "level": "critical",
                        "message": f"CRITICAL: Temperature {temperature}°C is dangerously abnormal"})
    elif temperature < TEMP_LOW_WARN or temperature > TEMP_HIGH_WARN:
        alerts.append({"field": "temperature", "level": "warning",
                        "message": f"WARNING: Temperature {temperature}°C is outside normal range (35–38°C)"})

    return alerts
