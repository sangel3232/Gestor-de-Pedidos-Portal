import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = () => {
    if (!user || !pass) { setError("Completa todos los campos"); return; }
    localStorage.setItem("user", user);
    navigate("/dashboard");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🛒 Gestor de Pedidos</h2>
        <p style={styles.sub}>Inicia sesión para continuar</p>
        <input
          style={styles.input}
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Contraseña"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.btn} onClick={login}>Ingresar</button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", background: "#0f172a",
  },
  card: {
    background: "#1e293b", borderRadius: 12, padding: "40px 36px",
    display: "flex", flexDirection: "column", gap: 14, width: 320,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  title: { color: "#38bdf8", margin: 0, textAlign: "center" },
  sub: { color: "#94a3b8", margin: 0, textAlign: "center", fontSize: 14 },
  input: {
    padding: "10px 14px", borderRadius: 8, border: "1px solid #334155",
    background: "#0f172a", color: "#e2e8f0", fontSize: 15, outline: "none",
  },
  btn: {
    padding: "11px", background: "#38bdf8", color: "#0f172a",
    border: "none", borderRadius: 8, fontWeight: "bold",
    fontSize: 15, cursor: "pointer", marginTop: 4,
  },
  error: { color: "#f87171", fontSize: 13, margin: 0 },
};
