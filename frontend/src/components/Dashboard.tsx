import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import api from "../api/axios";
import { useAuthStore } from "../store/auth";

const POLL_MS = 5000;

interface Vital {
  id: number; patient_id: number; heart_rate: number;
  spo2: number; temperature: number; recorded_at: string;
}
interface Patient { id: number; name: string; age: number; gender: string; ward?: string; }
interface Alert   { field: string; level: "warning" | "critical"; message: string; }

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, color }: { label: string; value: number | string; unit: string; color: string }) {
  return (
    <div style={{ background: color, borderRadius: 12, padding: "1.5rem", minWidth: 170, textAlign: "center", color: "#fff", flex: 1 }}>
      <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>{label}</div>
      <div style={{ fontSize: "2.8rem", fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: "0.8rem", opacity: 0.75 }}>{unit}</div>
    </div>
  );
}

function AlertBanner({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return null;
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {alerts.map((a, i) => (
        <div key={i} style={{
          padding: "0.85rem 1rem", borderRadius: 8, marginBottom: 8, fontWeight: 600,
          background: a.level === "critical" ? "#fef2f2" : "#fffbeb",
          color:      a.level === "critical" ? "#dc2626"  : "#d97706",
          border: `1px solid ${a.level === "critical" ? "#fca5a5" : "#fcd34d"}`,
        }}>
          {a.level === "critical" ? "🚨" : "⚠️"} {a.message}
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { username, logout } = useAuthStore();
  const navigate = useNavigate();

  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");

  // Patients list
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: () => api.get("/api/patients/").then((r) => r.data),
  });

  const pid = selectedPatient ?? patients[0]?.id ?? null;

  // Latest reading
  const { data: latest } = useQuery<Vital>({
    queryKey: ["latest", pid],
    queryFn:  () => api.get(`/api/vitals/latest?patient_id=${pid}`).then((r) => r.data),
    enabled:  !!pid,
    refetchInterval: POLL_MS,
  });

  // Alerts
  const { data: alertData } = useQuery<{ alerts: Alert[] }>({
    queryKey: ["alerts", pid],
    queryFn:  () => api.get(`/api/vitals/alerts?patient_id=${pid}`).then((r) => r.data),
    enabled:  !!pid,
    refetchInterval: POLL_MS,
  });

  // History with optional date filter
  const historyParams = new URLSearchParams({ limit: "50" });
  if (fromDate) historyParams.append("from_date", new Date(fromDate).toISOString());
  if (toDate)   historyParams.append("to_date",   new Date(toDate).toISOString());

  const { data: history = [] } = useQuery<Vital[]>({
    queryKey: ["history", pid, fromDate, toDate],
    queryFn:  () => api.get(`/api/vitals/${pid}?${historyParams}`).then((r) => r.data),
    enabled:  !!pid,
    refetchInterval: POLL_MS,
  });

  const sorted     = [...history].reverse();
  const timestamps = sorted.map((v) => new Date(v.recorded_at).toLocaleTimeString());

  const chartOptions: ApexOptions = {
    chart: { type: "line", animations: { enabled: true }, toolbar: { show: false } },
    xaxis: { categories: timestamps, labels: { rotate: -45 } },
    stroke: { curve: "smooth", width: 2 },
    legend: { position: "top" },
    colors: ["#e53e3e", "#3182ce", "#38a169"],
    tooltip: { x: { show: true } },
  };

  const series = [
    { name: "Heart Rate (bpm)", data: sorted.map((v) => v.heart_rate) },
    { name: "SpO2 (%)",         data: sorted.map((v) => v.spo2) },
    { name: "Temp (°C)",        data: sorted.map((v) => v.temperature) },
  ];

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", background: "#f0f4f8", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0, color: "#1a56db" }}>Patient Health Monitor</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>Logged in as <strong>{username}</strong></span>
          <button onClick={handleLogout} style={{ padding: "0.4rem 1rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            Logout
          </button>
        </div>
      </div>

      {/* Patient selector */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <label style={{ fontWeight: 600 }}>Patient:</label>
        <select
          value={pid ?? ""}
          onChange={(e) => setSelectedPatient(Number(e.target.value))}
          style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "1px solid #d1d5db", fontSize: "1rem" }}
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.age}y {p.gender}{p.ward ? ` | Ward: ${p.ward}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Alerts */}
      <AlertBanner alerts={alertData?.alerts ?? []} />

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <StatCard label="Heart Rate"  value={latest?.heart_rate  ?? "--"} unit="bpm" color="#e53e3e" />
        <StatCard label="SpO2"        value={latest?.spo2        ?? "--"} unit="%"   color="#3182ce" />
        <StatCard label="Temperature" value={latest?.temperature ?? "--"} unit="°C"  color="#38a169" />
      </div>

      {/* Date filter */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "1rem 1.5rem", marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontWeight: 600 }}>Filter by date:</span>
        <input type="datetime-local" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          style={{ padding: "0.4rem 0.8rem", borderRadius: 8, border: "1px solid #d1d5db" }} />
        <span>to</span>
        <input type="datetime-local" value={toDate} onChange={(e) => setToDate(e.target.value)}
          style={{ padding: "0.4rem 0.8rem", borderRadius: 8, border: "1px solid #d1d5db" }} />
        {(fromDate || toDate) && (
          <button onClick={() => { setFromDate(""); setToDate(""); }}
            style={{ padding: "0.4rem 0.8rem", background: "#6b7280", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
            Clear
          </button>
        )}
      </div>

      {/* Chart */}
      {sorted.length > 0 ? (
        <div style={{ background: "#fff", borderRadius: 12, padding: "1.5rem" }}>
          <h2 style={{ marginTop: 0 }}>Last {sorted.length} readings</h2>
          <ReactApexChart options={chartOptions} series={series} type="line" height={320} />
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af", background: "#fff", borderRadius: 12 }}>
          {pid ? "No readings yet — waiting for ESP32 data..." : "No patients found. Add a patient via the API."}
        </div>
      )}
    </div>
  );
}
