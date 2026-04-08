import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { username, email, password });
      navigate("/login?registered=1");
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Registration failed. Try a different username or email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Health Monitor</h1>
        <p style={styles.subtitle}>Create your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input} type="text" value={username}
            onChange={(e) => setUsername(e.target.value)} required autoFocus
          />

          <label style={styles.label}>Email</label>
          <input
            style={styles.input} type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input} type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} required minLength={6}
          />

          <label style={styles.label}>Confirm Password</label>
          <input
            style={styles.input} type="password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} required minLength={6}
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:     { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f4f8" },
  card:     { background: "#fff", borderRadius: 12, padding: "2.5rem", width: 380, boxShadow: "0 4px 24px rgba(0,0,0,0.1)" },
  title:    { margin: 0, fontSize: "1.6rem", color: "#1a56db", textAlign: "center" },
  subtitle: { textAlign: "center", color: "#6b7280", marginBottom: "1.5rem" },
  label:    { display: "block", marginBottom: 4, fontWeight: 600, fontSize: "0.9rem" },
  input:    { width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8, border: "1px solid #d1d5db", marginBottom: "1rem", fontSize: "1rem", boxSizing: "border-box" },
  button:   { width: "100%", padding: "0.75rem", background: "#1a56db", color: "#fff", border: "none", borderRadius: 8, fontSize: "1rem", fontWeight: 600, cursor: "pointer", marginBottom: "1rem" },
  error:    { background: "#fef2f2", color: "#dc2626", padding: "0.75rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.9rem" },
  footer:   { textAlign: "center", color: "#6b7280", fontSize: "0.9rem", margin: 0 },
  link:     { color: "#1a56db", fontWeight: 600, textDecoration: "none" },
};
