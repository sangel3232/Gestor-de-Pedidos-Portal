import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPedidos, getPedidosPorEstado, eliminarPedido, cambiarEstadoPedido } from "../../api";
import NavbarAdmin from "../../components/NavbarAdmin";

const ESTADOS = ["", "CREADO", "CONFIRMADO", "PAGADO", "CANCELADO"];
const COLORES = { CREADO: "#38bdf8", CONFIRMADO: "#a78bfa", PAGADO: "#4ade80", CANCELADO: "#f87171" };
// Transiciones válidas
const SIGUIENTES = { CREADO: ["CONFIRMADO", "CANCELADO"], CONFIRMADO: ["CANCELADO"], PAGADO: [], CANCELADO: [] };

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [msg, setMsg] = useState({ text: "", ok: true });

  const cargar = async () => {
    const res = filtro ? await getPedidosPorEstado(filtro) : await getPedidos();
    setPedidos(res.data.content || res.data);
  };

  useEffect(() => { cargar(); }, [filtro]);

  const notify = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 4000);
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await cambiarEstadoPedido(id, nuevoEstado);
      notify(`✅ Pedido #${id} → ${nuevoEstado}`);
      cargar();
    } catch (err) {
      notify("❌ " + (err.response?.data?.mensaje || "Error"), false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm(`¿Eliminar pedido #${id}?`)) return;
    try {
      await eliminarPedido(id);
      notify(`Pedido #${id} eliminado`);
      cargar();
    } catch (err) {
      notify("❌ " + (err.response?.data?.mensaje || "No se puede eliminar"), false);
    }
  };

  return (
    <div style={s.page}>
      <NavbarAdmin />
      <div style={s.content}>
        <h2 style={s.title}>Pedidos</h2>

        {msg.text && <p style={{ color: msg.ok ? "#4ade80" : "#f87171", marginBottom: 12, fontSize: 14 }}>{msg.text}</p>}

        {/* Filtros */}
        <div style={s.filtros}>
          {ESTADOS.map((e) => (
            <button key={e} onClick={() => setFiltro(e)}
              style={{ ...s.filtroBtn, background: filtro === e ? "#38bdf8" : "#1e293b", color: filtro === e ? "#0f172a" : "#e2e8f0" }}>
              {e || "Todos"}
            </button>
          ))}
        </div>

        <div style={s.table}>
          <div style={s.thead}>
            <span>ID</span><span>Descripción</span><span>Cliente</span>
            <span>Total</span><span>Estado</span><span>Fecha</span><span>Acciones</span>
          </div>
          {pedidos.length === 0 && <p style={s.empty}>Sin pedidos.</p>}
          {pedidos.map((p) => (
            <motion.div key={p.id} style={s.trow} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span style={{ color: "#64748b" }}>#{p.id}</span>
              <span>{p.descripcion}</span>
              <span>{p.cliente?.nombre || "-"}</span>
              <span style={{ color: "#4ade80" }}>${p.total?.toFixed(2)}</span>
              <span style={{ color: COLORES[p.estado] }}>{p.estado}</span>
              <span style={{ fontSize: 12 }}>{p.fecha ? new Date(p.fecha).toLocaleDateString() : "-"}</span>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {(SIGUIENTES[p.estado] || []).map((sig) => (
                  <button key={sig} onClick={() => handleCambiarEstado(p.id, sig)}
                    style={{ ...s.estadoBtn, background: COLORES[sig] + "33", color: COLORES[sig], border: `1px solid ${COLORES[sig]}44` }}>
                    → {sig}
                  </button>
                ))}
                {p.estado !== "PAGADO" && (
                  <button onClick={() => handleEliminar(p.id)} style={s.delBtn}>✕</button>
                )}
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
  title: { color: "#38bdf8", marginBottom: 16 },
  filtros: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  filtroBtn: { padding: "7px 16px", border: "none", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: "bold" },
  table: { background: "#1e293b", borderRadius: 10, overflow: "hidden" },
  thead: {
    display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px 120px 110px 1fr",
    padding: "10px 16px", background: "#0f172a", color: "#64748b", fontSize: 13, fontWeight: "bold",
  },
  trow: {
    display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px 120px 110px 1fr",
    padding: "10px 16px", borderTop: "1px solid #0f172a", fontSize: 13, alignItems: "center",
  },
  estadoBtn: { padding: "3px 8px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: "bold" },
  delBtn: { padding: "3px 8px", background: "#ef444422", color: "#f87171", border: "1px solid #ef444444", borderRadius: 5, cursor: "pointer", fontSize: 11 },
  empty: { padding: 16, color: "#64748b" },
};
