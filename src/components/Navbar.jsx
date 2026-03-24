import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>🛒 Gestor de Pedidos</span>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/clientes" style={styles.link}>Clientes</Link>
        <Link to="/pedidos" style={styles.link}>Pedidos</Link>
      </div>
      <div style={styles.user}>
        <span style={{ color: "#ccc", fontSize: 14 }}>👤 {user}</span>
        <button onClick={logout} style={styles.btn}>Salir</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "#1e293b", padding: "12px 24px", color: "#fff",
  },
  brand: { fontWeight: "bold", fontSize: 18, color: "#38bdf8" },
  links: { display: "flex", gap: 20 },
  link: { color: "#e2e8f0", textDecoration: "none", fontSize: 15 },
  user: { display: "flex", alignItems: "center", gap: 12 },
  btn: {
    background: "#ef4444", color: "#fff", border: "none",
    borderRadius: 6, padding: "6px 14px", cursor: "pointer",
  },
};
