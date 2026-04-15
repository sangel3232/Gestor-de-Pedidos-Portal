import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getPagosPorCliente } from "../../api";
import NavbarUsuario from "../../components/NavbarUsuario";

const COLORES = { COMPLETADO: "#4ade80", PENDIENTE: "#fbbf24", FALLIDO: "#f87171", REEMBOLSADO: "#a78bfa" };
const ICONOS = { COMPLETADO: "✅", PENDIENTE: "⏳", FALLIDO: "❌", REEMBOLSADO: "↩️" };

export default function MisPagos() {
  const { session } = useAuth();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.clienteId) return;
    getPagosPorCliente(session.clienteId)
      .then((r) => setPagos(r.data))
      .catch(() => setPagos([]))
      .finally(() => setLoading(false));
  }, [session]);

  const totalGastado = pagos
    .filter((p) => p.estado === "COMPLETADO")
    .reduce((a, p) => a + (p.monto || 0), 0);

  return (
    <div style={s.page}>
      <NavbarUsuario />
      <div style={s.content}>
        <h2 style={s.title}>Mis Pagos</h2>

        {/* Resumen */}
        <div style={s.stats}>
          <StatCard label="Total pagos" value={pagos.length} color="#38bdf8" />
          <StatCard label="Completados" value={pagos.filter(p => p.estado === "COMPLETADO").length} color="#4ade80" />
          <StatCard label="Total gastado" value={`$${totalGastado.toFixed(2)}`} color="#4ade80" />
        </div>

        {loading && <p style={s.hint}>Cargando...</p>}
        {!loading && pagos.length === 0 && (
          <div style={s.empty}>
            <p style={{ fontSize: 48 }}>💳</p>
            <p>No tienes pagos registrados aún.</p>
          </div>
        )}

        <div style={s.list}>
          {pagos.map((p) => (
            <motion.div key={p.id} style={{ ...s.card, borderLeft: `4px solid ${COLORES[p.estado] || "#334155"}` }}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <div style={s.cardHeader}>
                <span style={s.pagoId}>{ICONOS[p.estado]} Pago #{p.id}</span>
                <span style={{ ...s.estadoBadge, color: COLORES[p.estado] }}>{p.estado}</span>
              </div>
              <p style={s.pedidoRef}>Pedido #{p.pedidoId} — {p.pedidoDescripcion}</p>
              <div style={s.cardFooter}>
                <div>
                  <p style={s.monto}>${p.monto?.toFixed(2)}</p>
                  <p style={s.metodo}>{p.metodoPago?.replace(/_/g, " ")}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  {p.referenciaExterna && (
                    <p style={s.ref}>Ref: {p.referenciaExterna}</p>
                  )}
                  <p style={s.fecha}>
                    {p.procesadoEn ? new Date(p.procesadoEn).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <motion.div style={{ ...s.statCard, borderTop: `3px solid ${color}` }}
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <p style={s.statLabel}>{label}</p>
      <p style={{ ...s.statValue, color }}>{value}</p>
    </motion.div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" },
  content: { padding: "28px 32px" },
  title: { color: "#4ade80", marginBottom: 20 },
  stats: { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 },
  statCard: { background: "#1e293b", borderRadius: 10, padding: "16px 22px", minWidth: 140, flex: "1 1 130px" },
  statLabel: { margin: 0, fontSize: 13, color: "#94a3b8" },
  statValue: { margin: "6px 0 0", fontSize: 26, fontWeight: "bold" },
  hint: { color: "#64748b" },
  empty: { textAlign: "center", color: "#64748b", padding: "60px 0" },
  list: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 },
  card: { background: "#1e293b", borderRadius: 12, padding: "18px 20px" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  pagoId: { fontWeight: "bold", fontSize: 15 },
  estadoBadge: { fontSize: 12, fontWeight: "bold" },
  pedidoRef: { margin: "0 0 12px", fontSize: 13, color: "#64748b" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
  monto: { margin: 0, color: "#4ade80", fontWeight: "bold", fontSize: 22 },
  metodo: { margin: "4px 0 0", fontSize: 12, color: "#94a3b8" },
  ref: { margin: 0, fontSize: 11, color: "#64748b" },
  fecha: { margin: "4px 0 0", fontSize: 13, color: "#94a3b8" },
};
