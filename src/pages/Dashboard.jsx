import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPedidos, getClientes } from "../api";
import Navbar from "../components/Navbar";

const ESTADOS = ["CREADO", "CONFIRMADO", "PAGADO", "CANCELADO"];
const COLORES = {
  CREADO: "#38bdf8", CONFIRMADO: "#a78bfa",
  PAGADO: "#4ade80", CANCELADO: "#f87171",
};

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    getPedidos().then((r) => setPedidos(r.data));
    getClientes().then((r) => setClientes(r.data));
  }, []);

  const totalPagado = pedidos
    .filter((p) => p.estado === "PAGADO")
    .reduce((acc, p) => acc + (p.total || 0), 0);

  const contarEstado = (e) => pedidos.filter((p) => p.estado === e).length;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <h2 style={styles.title}>Dashboard</h2>

        {/* Tarjetas resumen */}
        <div style={styles.grid}>
          <Card label="Total Pedidos" value={pedidos.length} color="#38bdf8" />
          <Card label="Clientes" value={clientes.length} color="#a78bfa" />
          <Card label="Total Pagado" value={`$${totalPagado.toFixed(2)}`} color="#4ade80" />
          {ESTADOS.map((e) => (
            <Card key={e} label={e} value={contarEstado(e)} color={COLORES[e]} />
          ))}
        </div>

        {/* Últimos pedidos */}
        <h3 style={styles.subtitle}>Últimos pedidos</h3>
        <div style={styles.table}>
          <div style={styles.thead}>
            <span>ID</span><span>Descripción</span>
            <span>Cliente</span><span>Total</span><span>Estado</span><span>Fecha</span>
          </div>
          {pedidos.slice(-10).reverse().map((p) => (
            <motion.div
              key={p.id}
              style={styles.row}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span>#{p.id}</span>
              <span>{p.descripcion}</span>
              <span>{p.cliente?.nombre || "-"}</span>
              <span>${p.total?.toFixed(2)}</span>
              <span style={{ color: COLORES[p.estado] }}>{p.estado}</span>
              <span>{p.fecha ? new Date(p.fecha).toLocaleDateString() : "-"}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, color }) {
  return (
    <motion.div
      style={{ ...styles.card, borderTop: `3px solid ${color}` }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <p style={styles.cardLabel}>{label}</p>
      <p style={{ ...styles.cardValue, color }}>{value}</p>
    </motion.div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" },
  content: { padding: "28px 32px" },
  title: { color: "#38bdf8", marginBottom: 20 },
  subtitle: { color: "#94a3b8", margin: "28px 0 12px" },
  grid: { display: "flex", flexWrap: "wrap", gap: 16 },
  card: {
    background: "#1e293b", borderRadius: 10, padding: "18px 24px",
    minWidth: 150, flex: "1 1 140px",
  },
  cardLabel: { margin: 0, fontSize: 13, color: "#94a3b8" },
  cardValue: { margin: "6px 0 0", fontSize: 28, fontWeight: "bold" },
  table: { background: "#1e293b", borderRadius: 10, overflow: "hidden" },
  thead: {
    display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px 120px 120px",
    padding: "10px 16px", background: "#0f172a",
    color: "#64748b", fontSize: 13, fontWeight: "bold",
  },
  row: {
    display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px 120px 120px",
    padding: "10px 16px", borderTop: "1px solid #0f172a", fontSize: 14,
  },
};
