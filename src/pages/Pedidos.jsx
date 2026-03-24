import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPedidos, getPedidosPorEstado, crearPedido, eliminarPedido, getClientes } from "../api";
import Navbar from "../components/Navbar";

const ESTADOS = ["", "CREADO", "CONFIRMADO", "PAGADO", "CANCELADO"];
const COLORES = {
  CREADO: "#38bdf8", CONFIRMADO: "#a78bfa",
  PAGADO: "#4ade80", CANCELADO: "#f87171",
};
const EMPTY = { descripcion: "", total: "", clienteId: "" };

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    const res = filtro
      ? await getPedidosPorEstado(filtro)
      : await getPedidos();
    setPedidos(res.data);
  };

  useEffect(() => { cargar(); }, [filtro]);
  useEffect(() => { getClientes().then((r) => setClientes(r.data)); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.descripcion || !form.total || !form.clienteId) {
      setMsg("Completa todos los campos"); return;
    }
    setLoading(true);
    try {
      await crearPedido({
        descripcion: form.descripcion,
        total: parseFloat(form.total),
        cliente: { id: parseInt(form.clienteId) },
      });
      setForm(EMPTY);
      setMsg("✅ Pedido creado");
      cargar();
    } catch (err) {
      setMsg("❌ " + (err.response?.data || "Error al crear pedido"));
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm(`¿Eliminar pedido #${id}?`)) return;
    await eliminarPedido(id);
    cargar();
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <h2 style={styles.title}>Pedidos</h2>

        {/* Formulario nuevo pedido */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.formTitle}>Nuevo pedido</h3>
          <div style={styles.formRow}>
            <input name="descripcion" placeholder="Descripción" value={form.descripcion}
              onChange={handleChange} style={styles.input} />
            <input name="total" placeholder="Total ($)" type="number" step="0.01"
              value={form.total} onChange={handleChange} style={{ ...styles.input, maxWidth: 140 }} />
            <select name="clienteId" value={form.clienteId}
              onChange={handleChange} style={styles.select}>
              <option value="">Seleccionar cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? "Guardando..." : "Crear pedido"}
            </button>
          </div>
          {msg && <p style={styles.msg}>{msg}</p>}
        </form>

        {/* Filtro por estado */}
        <div style={styles.filtros}>
          {ESTADOS.map((e) => (
            <button key={e} onClick={() => setFiltro(e)}
              style={{
                ...styles.filtroBtn,
                background: filtro === e ? "#38bdf8" : "#1e293b",
                color: filtro === e ? "#0f172a" : "#e2e8f0",
              }}>
              {e || "Todos"}
            </button>
          ))}
        </div>

        {/* Tabla */}
        <div style={styles.table}>
          <div style={styles.thead}>
            <span>ID</span><span>Descripción</span><span>Cliente</span>
            <span>Total</span><span>Estado</span><span>Fecha</span><span>Acción</span>
          </div>
          {pedidos.length === 0 && (
            <p style={{ padding: 16, color: "#64748b" }}>Sin pedidos.</p>
          )}
          {pedidos.map((p) => (
            <motion.div key={p.id} style={styles.trow}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span>#{p.id}</span>
              <span>{p.descripcion}</span>
              <span>{p.cliente?.nombre || "-"}</span>
              <span>${p.total?.toFixed(2)}</span>
              <span style={{ color: COLORES[p.estado] }}>{p.estado}</span>
              <span>{p.fecha ? new Date(p.fecha).toLocaleDateString() : "-"}</span>
              <button onClick={() => handleEliminar(p.id)} style={styles.delBtn}>
                Eliminar
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" },
  content: { padding: "28px 32px" },
  title: { color: "#38bdf8", marginBottom: 20 },
  form: { background: "#1e293b", borderRadius: 10, padding: "20px 24px", marginBottom: 20 },
  formTitle: { margin: "0 0 14px", color: "#94a3b8", fontSize: 15 },
  formRow: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" },
  input: {
    flex: "1 1 160px", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #334155", background: "#0f172a",
    color: "#e2e8f0", fontSize: 14, outline: "none",
  },
  select: {
    flex: "1 1 160px", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #334155", background: "#0f172a",
    color: "#e2e8f0", fontSize: 14, outline: "none",
  },
  btn: {
    padding: "10px 22px", background: "#38bdf8", color: "#0f172a",
    border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer",
  },
  msg: { marginTop: 10, fontSize: 14, color: "#4ade80" },
  filtros: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  filtroBtn: {
    padding: "7px 16px", border: "none", borderRadius: 20,
    cursor: "pointer", fontSize: 13, fontWeight: "bold",
  },
  table: { background: "#1e293b", borderRadius: 10, overflow: "hidden" },
  thead: {
    display: "grid",
    gridTemplateColumns: "60px 1fr 1fr 100px 120px 110px 90px",
    padding: "10px 16px", background: "#0f172a",
    color: "#64748b", fontSize: 13, fontWeight: "bold",
  },
  trow: {
    display: "grid",
    gridTemplateColumns: "60px 1fr 1fr 100px 120px 110px 90px",
    padding: "10px 16px", borderTop: "1px solid #0f172a",
    fontSize: 14, alignItems: "center",
  },
  delBtn: {
    padding: "5px 10px", background: "#ef4444", color: "#fff",
    border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12,
  },
};
