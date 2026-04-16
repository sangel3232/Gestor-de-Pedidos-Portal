import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getPedidosPorCliente, cambiarEstadoPedido } from "../../api";
import NavbarUsuario from "../../components/NavbarUsuario";

const COLORES = { CREADO: "#38bdf8", CONFIRMADO: "#a78bfa", PAGADO: "#4ade80", CANCELADO: "#f87171" };

export default function MisPedidos() {
  const { session } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [cancelModal, setCancelModal] = useState({ open: false, pedido: null, observacion: "" });

  const cargarPedidos = () => {
    if (!session?.clienteId) return;
    setLoading(true);
    getPedidosPorCliente(session.clienteId)
      .then((r) => setPedidos(Array.isArray(r.data) ? r.data : []))
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false));
  };

  const notify = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 4000);
  };

  useEffect(() => {
    cargarPedidos();
  }, [session]);

  const handleCancelar = (pedido) => {
    setCancelModal({ open: true, pedido, observacion: "" });
  };

  const cerrarModalCancelacion = () => {
    setCancelModal({ open: false, pedido: null, observacion: "" });
  };

  const enviarCancelacion = async () => {
    const { pedido, observacion } = cancelModal;
    if (!pedido) return;
    if (!observacion.trim()) {
      window.alert("Escribe una observación para cancelar el pedido.");
      return;
    }
    try {
      await cambiarEstadoPedido(pedido.id, "CANCELADO", observacion.trim());
      notify(`✅ Pedido #${pedido.id} cancelado`);
      cerrarModalCancelacion();
      cargarPedidos();
    } catch (err) {
      notify("❌ " + (err.response?.data?.mensaje || "No se pudo cancelar"), false);
    }
  };

  return (
    <div style={s.page}>
      <NavbarUsuario />
      <div style={s.content}>
        <h2 style={s.title}>Mis Pedidos</h2>

        {msg.text && <p style={{ color: msg.ok ? "#4ade80" : "#f87171", marginBottom: 12, fontSize: 14 }}>{msg.text}</p>}
        {cancelModal.open && (
          <div style={s.modalBackdrop}>
            <div style={s.modal}>
              <h3 style={s.modalTitle}>Cancelar pedido</h3>
              <p style={s.modalText}>Escribe el motivo de cancelación para el pedido #{cancelModal.pedido?.id}.</p>
              <textarea
                value={cancelModal.observacion}
                onChange={(e) => setCancelModal((prev) => ({ ...prev, observacion: e.target.value }))}
                style={s.modalTextarea}
                placeholder="Motivo de cancelación"
                rows={4}
              />
              <div style={s.modalActions}>
                <button onClick={cerrarModalCancelacion} style={s.modalCancelBtn}>Cancelar</button>
                <button onClick={enviarCancelacion} style={s.modalSubmitBtn}>Confirmar cancelación</button>
              </div>
            </div>
          </div>
        )}
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
              <p style={s.meta}>Cliente: {p.cliente?.nombre || "-"} · Ciudad: {p.cliente?.ciudad || "-"}</p>
              <p style={s.meta}>Destino: {p.ciudadDestino || "-"}</p>
              {p.observacionCancelacion && (
                <p style={s.obs}>Motivo cancelación: {p.observacionCancelacion}</p>
              )}
              <div style={s.cardFooter}>
                <span style={s.total}>${p.total?.toFixed(2)}</span>
                <span style={s.fecha}>{p.fecha ? new Date(p.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
              </div>
              {(p.estado === "CREADO" || p.estado === "CONFIRMADO") && (
                <button onClick={() => handleCancelar(p)} style={s.cancelBtn}>Cancelar pedido</button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f8fafc", color: "#111827" },
  content: { padding: "28px 32px" },
  title: { color: "#b91c1c", marginBottom: 24 },
  hint: { color: "#6b7280" },
  empty: { textAlign: "center", color: "#6b7280", padding: "60px 0" },
  list: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },
  card: { background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid #e5e7eb" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  pedidoId: { fontWeight: "bold", color: "#111827", fontSize: 14 },
  estadoBadge: { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: "bold" },
  descripcion: { margin: "0 0 12px", fontSize: 14, color: "#374151", lineHeight: 1.5 },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  total: { color: "#111827", fontWeight: "bold", fontSize: 20 },
  fecha: { color: "#6b7280", fontSize: 13 },
  meta: { color: "#6b7280", fontSize: 12, margin: "4px 0 0" },
  obs: { color: "#dc2626", fontSize: 12, margin: "4px 0 0" },
  cancelBtn: {
    width: "100%", marginTop: 12, padding: "10px", borderRadius: 8,
    background: "#dc2626", color: "#fff", border: "none", cursor: "pointer",
  },
  modalBackdrop: {
    position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.16)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modal: {
    background: "#fff", borderRadius: 16, padding: "24px", maxWidth: 520, width: "100%", boxShadow: "0 20px 60px rgba(15,23,42,0.08)", border: "1px solid #e5e7eb",
  },
  modalTitle: { margin: 0, color: "#b91c1c", fontSize: 20, marginBottom: 10 },
  modalText: { color: "#6b7280", marginBottom: 18, fontSize: 14 },
  modalTextarea: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #d1d5db", background: "#f8fafc", color: "#111827", outline: "none", resize: "vertical", fontSize: 14, minHeight: 112 },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 },
  modalCancelBtn: { padding: "10px 16px", borderRadius: 10, border: "1px solid #d1d5db", background: "#f3f4f6", color: "#111827", cursor: "pointer" },
  modalSubmitBtn: { padding: "10px 16px", borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer" },
};
