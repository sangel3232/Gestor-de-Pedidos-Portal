import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/tienda",         label: "🛍️ Tienda" },
  { to: "/tienda/pedidos", label: "📦 Mis Pedidos" },
  { to: "/tienda/pagos",   label: "💳 Mis Pagos" },
];

export default function NavbarUsuario({ totalCarrito = 0, onAbrirCarrito }) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav style={s.nav}>
      <span style={s.brand}>🛒 Gestor de Pedidos</span>

      <div style={s.links}>
        {LINKS.map(({ to, label }) => (
          <Link key={to} to={to}
            style={{ ...s.link, ...(pathname === to ? s.linkActive : {}) }}>
            {label}
          </Link>
        ))}
        {onAbrirCarrito && (
          <button onClick={onAbrirCarrito} style={{ ...s.link, ...s.carritoBtn }}>
            🛒 Carrito
            {totalCarrito > 0 && <span style={s.cartCount}>{totalCarrito}</span>}
          </button>
        )}
      </div>

      <div style={s.user}>
        <span style={s.rolBadge}>USUARIO</span>
        <span style={s.name}>👤 {session?.nombre}</span>
        <button onClick={handleLogout} style={s.btn}>Salir</button>
      </div>
    </nav>
  );
}

const s = {
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "#1e293b", padding: "12px 24px", borderBottom: "2px solid #4ade8020",
  },
  brand: { fontWeight: "bold", fontSize: 17, color: "#4ade80", whiteSpace: "nowrap" },
  links: { display: "flex", gap: 4, alignItems: "center" },
  link: {
    color: "#94a3b8", textDecoration: "none", fontSize: 14,
    padding: "6px 14px", borderRadius: 6,
  },
  linkActive: { background: "#4ade8015", color: "#4ade80", fontWeight: "bold" },
  carritoBtn: {
    background: "none", border: "none", cursor: "pointer",
    position: "relative", display: "inline-flex", alignItems: "center", gap: 4,
  },
  cartCount: {
    position: "absolute", top: -4, right: -4, background: "#4ade80",
    color: "#0f172a", borderRadius: "50%", width: 18, height: 18,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: "bold",
  },
  user: { display: "flex", alignItems: "center", gap: 10 },
  rolBadge: {
    fontSize: 10, padding: "2px 8px", borderRadius: 4,
    background: "#4ade8022", color: "#4ade80", fontWeight: "bold",
  },
  name: { color: "#94a3b8", fontSize: 13 },
  btn: {
    background: "#ef4444", color: "#fff", border: "none",
    borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13,
  },
};
