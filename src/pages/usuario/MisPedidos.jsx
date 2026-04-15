import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getPedidosPorCliente } from "../../api";
import NavbarUsuario from "../../components/NavbarUsuario";

const COLORES = { CREADO: "#38bdf8", CONFIRMADO: "#a78bfa", PAGADO: "#4ade80", CANCELADO: "#f87171" };

export default function MisPedidos() {
  const { session } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.clienteId) return;
    getPedidosPorCliente(session.clienteId)
      .then((r) => setPedidos(Array.isArray(r.data) ? r.data : []))
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <div style={s.page}>
      <NavbarUsuario />
      <div style={s.content}>
        <h2 style={s.title}>Mis Pedidos</h2>

        {loading && <p style={s.hint}>Cargando...</p>}
        {!loading && pedidos.length === 0 && (
          <div style={s.empty}>
            <p style={{ fontSize: 48 }}>📦</p>
            <p>Aún no tienes pedidos. ¡Ve a la tienda y haz tu primera compra!</p>
          </div>
        )}

        <div style={s.list}>
          {pedidos.map((p) => (
            <motion.div key={p.id} style={s.card}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <div style={s.cardHeader}>
                <span style={s.pedidoId}>Pedido #{p.id}</span>
                <span style={{ ...s.estadoBadge, background: COLORES[p.estado] + "22", color: COLORES[p.estado] }}>
                  {p.estado}
                </span>
              </div>
              <p style={s.descripcion}>{p.descripcion}</p>
              <div style={s.cardFooter}>
                <span style={s.total}>${p.total?.toFixed(2)}</span>
                <span style={s.fecha}>{p.fecha ? new Date(p.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" },
  content: { padding: "28px 32px" },
  title: { color: "#4ade80", marginBottom: 24 },
  hint: { color: "#64748b" },
  empty: { textAlign: "center", color: "#64748b", padding: "60px 0" },
  list: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },
  card: { background: "#1e293b", borderRadius: 12, padding: "18px 20px", border: "1px solid #334155" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  pedidoId: { fontWeight: "bold", color: "#94a3b8", fontSize: 14 },
  estadoBadge: { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: "bold" },
  descripcion: { margin: "0 0 12px", fontSize: 14, color: "#e2e8f0", lineHeight: 1.5 },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  total: { color: "#4ade80", fontWeight: "bold", fontSize: 20 },
  fecha: { color: "#64748b", fontSize: 13 },
};
