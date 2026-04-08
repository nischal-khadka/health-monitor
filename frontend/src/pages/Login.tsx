import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const login    = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const registered = params.get("registered") === "1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const form = new URLSearchParams();
      form.append("username", username);
      form.append("password", password);
      const res = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      login(res.data.access_token, username);
      navigate("/");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Health Monitor</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {registered && <div style={styles.success}>Account created! Please sign in.</div>}
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:     { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f4f8" },
  card:     { background: "#fff", borderRadius: 12, padding: "2.5rem", width: 360, boxShadow: "0 4px 24px rgba(0,0,0,0.1)" },
  title:    { margin: 0, fontSize: "1.6rem", color: "#1a56db", textAlign: "center" },
  subtitle: { textAlign: "center", color: "#6b7280", marginBottom: "1.5rem" },
  label:    { display: "block", marginBottom: 4, fontWeight: 600, fontSize: "0.9rem" },
  input:    { width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8, border: "1px solid #d1d5db", marginBottom: "1rem", fontSize: "1rem", boxSizing: "border-box" },
  button:   { width: "100%", padding: "0.75rem", background: "#1a56db", color: "#fff", border: "none", borderRadius: 8, fontSize: "1rem", fontWeight: 600, cursor: "pointer" },
  error:    { background: "#fef2f2", color: "#dc2626", padding: "0.75rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.9rem" },
  success:  { background: "#f0fdf4", color: "#16a34a", padding: "0.75rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 600 },
  footer:   { textAlign: "center", color: "#6b7280", fontSize: "0.9rem", margin: "0.5rem 0 0" },
  link:     { color: "#1a56db", fontWeight: 600, textDecoration: "none" },
};
