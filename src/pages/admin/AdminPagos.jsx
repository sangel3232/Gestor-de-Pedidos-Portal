import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPagos, getClientes, getPagosPorCliente } from "../../api";
import NavbarAdmin from "../../components/NavbarAdmin";

const COLORES = { COMPLETADO: "#4ade80", PENDIENTE: "#fbbf24", FALLIDO: "#f87171", REEMBOLSADO: "#a78bfa" };

export default function AdminPagos() {
  const [pagos, setPagos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClientes().then((r) => setClientes(r.data.content || r.data));
    cargarPagos();
  }, []);

  const cargarPagos = async (clienteId = "") => {
    setLoading(true);
    try {
      const res = clienteId ? await getPagosPorCliente(clienteId) : await getPagos();
      setPagos(res.data);
    } finally { setLoading(false); }
  };

  const totalCobrado = pagos.filter(p => p.estado === "COMPLETADO").reduce((a, p) => a + (p.monto || 0), 0);

  return (
    <div style={s.page}>
      <NavbarAdmin />
      <div style={s.content}>
        <h2 style={s.title}>Pagos</h2>

        <div style={s.stats}>
          {[
            { label: "Total", value: pagos.length, color: "#38bdf8" },
            { label: "Completados", value: pagos.filter(p => p.estado === "COMPLETADO").length, color: "#4ade80" },
            { label: "Fallidos", value: pagos.filter(p => p.estado === "FALLIDO").length, color: "#f87171" },
            { label: "Facturado", value: `$${totalCobrado.toFixed(2)}`, color: "#4ade80" },
          ].map(({ label, value, color }) => (
            <motion.div key={label} style={{ ...s.statCard, borderTop: `3px solid ${color}` }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <p style={s.statLabel}>{label}</p>
              <p style={{ ...s.statValue, color }}>{value}</p>
            </motion.div>
          ))}
        </div>

        <div style={s.filtroRow}>
          <label style={s.label}>Filtrar por cliente:</label>
          <select value={filtroCliente} onChange={(e) => { setFiltroCliente(e.target.value); cargarPagos(e.target.value); }} style={s.select}>
            <option value="">Todos</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        <div style={s.table}>
          <div style={s.thead}>
            <span>ID</span><span>Pedido</span><span>Cliente</span>
            <span>Monto</span><span>Método</span><span>Estado</span><span>Referencia</span><span>Fecha</span>
          </div>
          {loading && <p style={s.hint}>Cargando...</p>}
          {!loading && pagos.length === 0 && <p style={s.hint}>Sin pagos.</p>}
          {pagos.map((p) => (
            <motion.div key={p.id} style={s.row} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span>#{p.id}</span>
              <span>#{p.pedidoId}</span>
              <span>{p.clienteNombre || "-"}</span>
              <span style={{ color: "#4ade80", fontWeight: "bold" }}>${p.monto?.toFixed(2)}</span>
              <span style={{ fontSize: 12 }}>{p.metodoPago?.replace(/_/g, " ")}</span>
              <span style={{ color: COLORES[p.estado], fontWeight: "bold" }}>{p.estado}</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>{p.referenciaExterna || "—"}</span>
              <span style={{ fontSize: 12 }}>{p.procesadoEn ? new Date(p.procesadoEn).toLocaleString() : "—"}</span>
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
  title: { color: "#38bdf8", marginBottom: 20 },
  stats: { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 },
  statCard: { background: "#1e293b", borderRadius: 10, padding: "16px 22px", minWidth: 140, flex: "1 1 130px" },
  statLabel: { margin: 0, fontSize: 13, color: "#94a3b8" },
  statValue: { margin: "6px 0 0", fontSize: 26, fontWeight: "bold" },
  filtroRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
  label: { fontSize: 13, color: "#94a3b8" },
  select: { padding: "9px 14px", borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", fontSize: 14, outline: "none", minWidth: 220 },
  table: { background: "#1e293b", borderRadius: 10, overflow: "hidden" },
  thead: { display: "grid", gridTemplateColumns: "50px 70px 1fr 100px 130px 110px 160px 140px", padding: "10px 16px", background: "#0f172a", color: "#64748b", fontSize: 12, fontWeight: "bold" },
  row: { display: "grid", gridTemplateColumns: "50px 70px 1fr 100px 130px 110px 160px 140px", padding: "10px 16px", borderTop: "1px solid #0f172a", fontSize: 13, alignItems: "center" },
  hint: { padding: 16, color: "#64748b", fontSize: 14 },
};
