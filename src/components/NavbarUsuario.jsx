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
    background: "#fff", padding: "12px 24px", borderBottom: "2px solid #fecaca",
  },
  brand: { fontWeight: "bold", fontSize: 17, color: "#dc2626", whiteSpace: "nowrap" },
  links: { display: "flex", gap: 4, alignItems: "center" },
  link: {
    color: "#374151", textDecoration: "none", fontSize: 14,
    padding: "6px 14px", borderRadius: 6,
  },
  linkActive: { background: "#fee2e2", color: "#b91c1c", fontWeight: "bold" },
  carritoBtn: {
    background: "#fef2f2", border: "1px solid #fbcaca", cursor: "pointer",
    position: "relative", display: "inline-flex", alignItems: "center", gap: 4,
    color: "#b91c1c", borderRadius: 6, padding: "6px 12px",
  },
  cartCount: {
    position: "absolute", top: -4, right: -4, background: "#ef4444",
    color: "#fff", borderRadius: "50%", width: 18, height: 18,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: "bold",
  },
  user: { display: "flex", alignItems: "center", gap: 10 },
  rolBadge: {
    fontSize: 10, padding: "2px 8px", borderRadius: 4,
    background: "#fee2e2", color: "#b91c1c", fontWeight: "bold",
  },
  name: { color: "#6b7280", fontSize: 13 },
  btn: {
    background: "#dc2626", color: "#fff", border: "none",
    borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13,
  },
};
