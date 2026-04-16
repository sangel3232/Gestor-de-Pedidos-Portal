import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  getProductos, getCarrito, agregarItemCarrito,
  actualizarItemCarrito, eliminarItemCarrito, vaciarCarrito,
  crearPedido, cambiarEstadoPedido, procesarPago,
} from "../../api";
import NavbarUsuario from "../../components/NavbarUsuario";

const METODOS = ["TARJETA_CREDITO", "TARJETA_DEBITO", "TRANSFERENCIA", "EFECTIVO"];

export default function Tienda() {
  const { session } = useAuth();
  const clienteId = session?.clienteId;

  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [vistaCarrito, setVistaCarrito] = useState(false);
  const [showPago, setShowPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState("TARJETA_CREDITO");
  const [destino, setDestino] = useState("");
  const [tarjeta, setTarjeta] = useState({ numero: "", titular: "", expiracion: "", cvv: "" });
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    getProductos().then((r) => setProductos(r.data));
    if (clienteId) cargarCarrito();
  }, [clienteId]);

  const cargarCarrito = async () => {
    try {
      const r = await getCarrito(clienteId);
      setCarrito(r.data);
    } catch { setCarrito({ items: [], total: 0 }); }
  };

  const notify = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 4000);
  };

  const handleAgregar = async (productoId) => {
    try {
      const r = await agregarItemCarrito(clienteId, { productoId, cantidad: 1 });
      setCarrito(r.data);
      notify("✅ Agregado al carrito");
    } catch (e) {
      notify("❌ " + (e.response?.data?.mensaje || "Error"), false);
    }
  };

  const handleCantidad = async (itemId, cantidad) => {
    const r = await actualizarItemCarrito(clienteId, itemId, cantidad);
    setCarrito(r.data);
  };

  const handleEliminarItem = async (itemId) => {
    const r = await eliminarItemCarrito(clienteId, itemId);
    setCarrito(r.data);
  };

  const handleCheckout = async () => {
    if (!carrito?.items?.length) { notify("El carrito está vacío", false); return; }
    if (!destino.trim()) { notify("Debes ingresar la ciudad destino", false); return; }
    setProcesando(true);
    try {
      const descripcion = carrito.items.map((i) => `${i.cantidad}x ${i.productoNombre}`).join(", ");
      const pedidoRes = await crearPedido({ descripcion, total: carrito.total, clienteId, ciudadDestino: destino.trim() });
      const pedidoId = pedidoRes.data.id;
      await cambiarEstadoPedido(pedidoId, "CONFIRMADO");

      const pagoData = {
        pedidoId, metodoPago,
        ...(metodoPago !== "TRANSFERENCIA" && metodoPago !== "EFECTIVO" && {
          numeroTarjeta: tarjeta.numero, titularTarjeta: tarjeta.titular,
          fechaExpiracion: tarjeta.expiracion, cvv: tarjeta.cvv,
        }),
      };
      const pagoRes = await procesarPago(pagoData);

      if (pagoRes.data.estado === "COMPLETADO") {
        notify(`✅ ¡Pago exitoso! Ref: ${pagoRes.data.referenciaExterna}`);
        setShowPago(false);
        setVistaCarrito(false);
        setDestino("");
        await vaciarCarrito(clienteId);
        cargarCarrito();
      } else {
        notify(`❌ Pago rechazado: ${pagoRes.data.mensajeRespuesta}`, false);
      }
    } catch (e) {
      notify("❌ " + (e.response?.data?.mensaje || "Error en el pago"), false);
    } finally {
      setProcesando(false);
    }
  };

  const totalItems = carrito?.items?.reduce((a, i) => a + i.cantidad, 0) || 0;
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={s.page}>
      <NavbarUsuario totalCarrito={totalItems} onAbrirCarrito={() => { setVistaCarrito(true); setShowPago(false); }} />
      <div style={s.content}>

        {msg.text && (
          <motion.div style={{ ...s.toast, background: msg.ok ? "#14532d" : "#7f1d1d", borderColor: msg.ok ? "#4ade80" : "#f87171" }}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            {msg.text}
          </motion.div>
        )}

        {/* Header tienda */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>Tienda</h2>
            <p style={s.welcome}>Hola, {session?.nombre} 👋</p>
          </div>
          <button onClick={() => { setVistaCarrito(!vistaCarrito); setShowPago(false); }} style={s.carritoBtn}>
            🛒 Carrito
            {totalItems > 0 && <span style={s.badge}>{totalItems}</span>}
          </button>
        </div>

        <div style={s.layout}>
          {/* Catálogo */}
          <div style={{ flex: 1 }}>
            <input placeholder="🔍 Buscar productos..." value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)} style={s.search} />

            <div style={s.grid}>
              {productosFiltrados.map((p) => (
                <motion.div key={p.id} style={s.productoCard}
                  whileHover={{ scale: 1.02 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={s.productoIcon}>📦</div>
                  <p style={s.productoNombre}>{p.nombre}</p>
                  <p style={s.productoDesc}>{p.descripcion || "Sin descripción"}</p>
                  <div style={s.productoFooter}>
                    <span style={s.productoPrecio}>${parseFloat(p.precio).toFixed(2)}</span>
                    <span style={{ ...s.stockBadge, color: p.stock > 0 ? "#4ade80" : "#f87171" }}>
                      {p.stock > 0 ? `Stock: ${p.stock}` : "Agotado"}
                    </span>
                  </div>
                  <button onClick={() => handleAgregar(p.id)} style={s.addBtn}
                    disabled={p.stock === 0}>
                    {p.stock === 0 ? "Sin stock" : "Agregar al carrito"}
                  </button>
                </motion.div>
              ))}
              {productosFiltrados.length === 0 && (
                <p style={s.empty}>No se encontraron productos.</p>
              )}
            </div>
          </div>

          {/* Panel carrito */}
          <AnimatePresence>
            {vistaCarrito && (
              <motion.div style={s.carritoPanel}
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}>
                <div style={s.carritoPanelHeader}>
                  <h3 style={s.carritoTitle}>🛒 Mi Carrito</h3>
                  <button onClick={() => setVistaCarrito(false)} style={s.closeBtn}>✕</button>
                </div>

                {(!carrito?.items || carrito.items.length === 0) && (
                  <p style={s.empty}>El carrito está vacío</p>
                )}

                {carrito?.items?.map((item) => (
                  <div key={item.id} style={s.itemRow}>
                    <div style={{ flex: 1 }}>
                      <p style={s.itemNombre}>{item.productoNombre}</p>
                      <p style={s.itemPrecio}>${item.precioUnitario?.toFixed(2)} c/u</p>
                    </div>
                    <div style={s.qtyCtrl}>
                      <button style={s.qtyBtn} onClick={() => handleCantidad(item.id, item.cantidad - 1)}>−</button>
                      <span style={s.qty}>{item.cantidad}</span>
                      <button style={s.qtyBtn} onClick={() => handleCantidad(item.id, item.cantidad + 1)}>+</button>
                    </div>
                    <span style={s.itemSubtotal}>${item.subtotal?.toFixed(2)}</span>
                    <button onClick={() => handleEliminarItem(item.id)} style={s.removeBtn}>✕</button>
                  </div>
                ))}

                {carrito?.items?.length > 0 && (
                  <>
                    <div style={s.totalRow}>
                      <span>Total</span>
                      <span style={s.totalValue}>${carrito.total?.toFixed(2)}</span>
                    </div>

                    {!showPago ? (
                      <button onClick={() => setShowPago(true)} style={s.checkoutBtn}>
                        Proceder al pago →
                      </button>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <p style={s.pagoLabel}>Método de pago</p>
                        <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={s.select}>
                          {METODOS.map((m) => <option key={m} value={m}>{m.replace(/_/g, " ")}</option>)}
                        </select>

                        <input
                          placeholder="Ciudad destino"
                          style={s.input}
                          value={destino}
                          onChange={(e) => setDestino(e.target.value)}
                        />

                        {(metodoPago === "TARJETA_CREDITO" || metodoPago === "TARJETA_DEBITO") && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                            <input placeholder="Número de tarjeta" style={s.input}
                              value={tarjeta.numero} onChange={(e) => setTarjeta({ ...tarjeta, numero: e.target.value })} />
                            <input placeholder="Titular" style={s.input}
                              value={tarjeta.titular} onChange={(e) => setTarjeta({ ...tarjeta, titular: e.target.value })} />
                            <div style={{ display: "flex", gap: 8 }}>
                              <input placeholder="MM/AA" style={{ ...s.input, flex: 1 }}
                                value={tarjeta.expiracion} onChange={(e) => setTarjeta({ ...tarjeta, expiracion: e.target.value })} />
                              <input placeholder="CVV" style={{ ...s.input, flex: 1 }}
                                value={tarjeta.cvv} onChange={(e) => setTarjeta({ ...tarjeta, cvv: e.target.value })} />
                            </div>
                            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
                              💡 Tarjeta terminada en 0000 simula rechazo
                            </p>
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button onClick={handleCheckout} style={s.checkoutBtn} disabled={procesando}>
                            {procesando ? "Procesando..." : `Pagar $${carrito.total?.toFixed(2)}`}
                          </button>
                          <button onClick={() => setShowPago(false)} style={s.cancelBtn}>Cancelar</button>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f8fafc", color: "#111827" },
  content: { padding: "24px 32px", position: "relative" },
  toast: {
    padding: "12px 18px", borderRadius: 8, border: "1px solid", marginBottom: 16, fontSize: 14,
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  title: { color: "#b91c1c", margin: 0 },
  welcome: { color: "#6b7280", margin: "4px 0 0", fontSize: 14 },
  carritoBtn: {
    position: "relative", padding: "10px 20px", background: "#fff",
    color: "#111827", border: "1px solid #e5e7eb", borderRadius: 8,
    cursor: "pointer", fontSize: 15, fontWeight: "bold",
  },
  badge: {
    position: "absolute", top: -6, right: -6, background: "#dc2626",
    color: "#fff", borderRadius: "50%", width: 20, height: 20,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: "bold",
  },
  layout: { display: "flex", gap: 24, alignItems: "flex-start" },
  search: {
    width: "100%", padding: "10px 16px", borderRadius: 8, marginBottom: 20,
    border: "1px solid #d1d5db", background: "#fff", color: "#111827",
    fontSize: 14, outline: "none", boxSizing: "border-box",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 },
  productoCard: {
    background: "#fff", borderRadius: 12, padding: "20px 18px",
    display: "flex", flexDirection: "column", gap: 8,
    border: "1px solid #e5e7eb", cursor: "default",
  },
  productoIcon: { fontSize: 32, textAlign: "center" },
  productoNombre: { margin: 0, fontWeight: "bold", fontSize: 15, color: "#111827" },
  productoDesc: { margin: 0, fontSize: 12, color: "#6b7280", flexGrow: 1 },
  productoFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  productoPrecio: { color: "#111827", fontWeight: "bold", fontSize: 18 },
  stockBadge: { fontSize: 12 },
  addBtn: {
    padding: "9px", background: "#dc2626", color: "#fff",
    border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer", fontSize: 14,
  },
  carritoPanel: {
    width: 340, minWidth: 300, background: "#fff", borderRadius: 12,
    padding: "20px", position: "sticky", top: 20,
    border: "1px solid #e5e7eb", flexShrink: 0,
  },
  carritoPanelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  carritoTitle: { margin: 0, color: "#b91c1c", fontSize: 16 },
  closeBtn: { background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 18 },
  itemRow: { display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #e5e7eb" },
  itemNombre: { margin: 0, fontSize: 13, fontWeight: "bold", color: "#111827" },
  itemPrecio: { margin: "2px 0 0", fontSize: 11, color: "#6b7280" },
  qtyCtrl: { display: "flex", alignItems: "center", gap: 4 },
  qtyBtn: { width: 24, height: 24, background: "#f3f4f6", color: "#111827", border: "1px solid #d1d5db", borderRadius: 5, cursor: "pointer" },
  qty: { minWidth: 20, textAlign: "center", fontSize: 13 },
  itemSubtotal: { color: "#111827", fontSize: 13, fontWeight: "bold", minWidth: 55, textAlign: "right" },
  removeBtn: { background: "transparent", color: "#dc2626", border: "none", cursor: "pointer", fontSize: 14 },
  totalRow: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid #e5e7eb", marginTop: 8 },
  totalValue: { color: "#111827", fontWeight: "bold", fontSize: 20 },
  checkoutBtn: {
    width: "100%", padding: "11px", background: "#dc2626", color: "#fff",
    border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer", fontSize: 15,
  },
  cancelBtn: {
    flex: 1, padding: "11px", background: "#f3f4f6", color: "#111827",
    border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer",
  },
  pagoLabel: { fontSize: 13, color: "#6b7280", margin: "12px 0 6px" },
  select: {
    width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db",
    background: "#fff", color: "#111827", fontSize: 14, outline: "none",
  },
  input: {
    width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db",
    background: "#fff", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box",
  },
  empty: { color: "#6b7280", fontSize: 14, padding: "12px 0" },
};
