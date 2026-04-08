import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

const API = "http://localhost:8000";
const PATIENT_ID = 1;
const POLL_MS = 5000;

interface Vital {
  id: number;
  patient_id: number;
  heart_rate: number;
  spo2: number;
  temperature: number;
  recorded_at: string;
}

function StatCard({ label, value, unit, color }: { label: string; value: number | string; unit: string; color: string }) {
  return (
    <div style={{ background: color, borderRadius: 12, padding: "1.5rem", minWidth: 160, textAlign: "center", color: "#fff" }}>
      <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>{label}</div>
      <div style={{ fontSize: "2.5rem", fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: "0.8rem", opacity: 0.75 }}>{unit}</div>
    </div>
  );
}

export default function Dashboard() {
  const { data: latest } = useQuery<Vital>({
    queryKey: ["latest", PATIENT_ID],
    queryFn: () => axios.get(`${API}/api/vitals/latest?patient_id=${PATIENT_ID}`).then(r => r.data),
    refetchInterval: POLL_MS,
  });

  const { data: history = [] } = useQuery<Vital[]>({
    queryKey: ["history", PATIENT_ID],
    queryFn: () => axios.get(`${API}/api/vitals/${PATIENT_ID}?limit=30`).then(r => r.data),
    refetchInterval: POLL_MS,
  });

  const timestamps = [...history].reverse().map(v => new Date(v.recorded_at).toLocaleTimeString());

  const chartOptions: ApexOptions = {
    chart: { type: "line", animations: { enabled: true } },
    xaxis: { categories: timestamps },
    stroke: { curve: "smooth", width: 2 },
    legend: { position: "top" },
  };

  const series = [
    { name: "Heart Rate (bpm)", data: [...history].reverse().map(v => v.heart_rate) },
    { name: "SpO2 (%)",         data: [...history].reverse().map(v => v.spo2) },
    { name: "Temp (°C)",        data: [...history].reverse().map(v => v.temperature) },
  ];

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", background: "#f0f4f8", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Patient Health Monitor</h1>

      {/* Live stats */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <StatCard label="Heart Rate"   value={latest?.heart_rate  ?? "--"} unit="bpm" color="#e53e3e" />
        <StatCard label="SpO2"         value={latest?.spo2        ?? "--"} unit="%"   color="#3182ce" />
        <StatCard label="Temperature"  value={latest?.temperature ?? "--"} unit="°C"  color="#38a169" />
      </div>

      {/* History chart */}
      {history.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "1.5rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>Last {history.length} readings</h2>
          <ReactApexChart options={chartOptions} series={series} type="line" height={300} />
        </div>
      )}

      {history.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
          Waiting for data from ESP32...
        </div>
      )}
    </div>
  );
}
