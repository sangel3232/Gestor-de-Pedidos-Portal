import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/productos",  label: "Productos" },
  { to: "/admin/clientes",   label: "Clientes" },
  { to: "/admin/pedidos",    label: "Pedidos" },
  { to: "/admin/pagos",      label: "Pagos" },
];

export default function NavbarAdmin() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav style={s.nav}>
      <span style={s.brand}>⚙️ Panel Admin</span>
      <div style={s.links}>
        {LINKS.map(({ to, label }) => (
          <Link key={to} to={to}
            style={{ ...s.link, ...(pathname === to ? s.linkActive : {}) }}>
            {label}
          </Link>
        ))}
      </div>
      <div style={s.user}>
        <span style={s.badge}>ADMIN</span>
        <span style={s.name}>👤 {session?.nombre}</span>
        <button onClick={handleLogout} style={s.btn}>Salir</button>
      </div>
    </nav>
  );
}

const s = {
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "#fff", padding: "12px 24px", borderBottom: "2px solid #fecaca",
  },
  brand: { fontWeight: "bold", fontSize: 17, color: "#b91c1c", whiteSpace: "nowrap" },
  links: { display: "flex", gap: 4 },
  link: {
    color: "#374151", textDecoration: "none", fontSize: 14,
    padding: "6px 14px", borderRadius: 6, transition: "all .15s",
  },
  linkActive: { background: "#fee2e2", color: "#b91c1c", fontWeight: "bold" },
  user: { display: "flex", alignItems: "center", gap: 10 },
  badge: {
    fontSize: 10, padding: "2px 8px", borderRadius: 4,
    background: "#fee2e2", color: "#b91c1c", fontWeight: "bold",
  },
  name: { color: "#6b7280", fontSize: 13 },
  btn: {
    background: "#b91c1c", color: "#fff", border: "none",
    borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13,
  },
};
