import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getClientes, crearCliente } from "../api";
import Navbar from "../components/Navbar";

const EMPTY = { nombre: "", email: "", ciudad: "" };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const cargar = () => getClientes().then((r) => setClientes(r.data));

  useEffect(() => { cargar(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.ciudad) {
      setMsg("Completa todos los campos"); return;
    }
    setLoading(true);
    try {
      await crearCliente(form);
      setForm(EMPTY);
      setMsg("✅ Cliente creado");
      cargar();
    } catch {
      setMsg("❌ Error al crear cliente");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <h2 style={styles.title}>Clientes</h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.formTitle}>Nuevo cliente</h3>
          <div style={styles.row}>
            <input name="nombre" placeholder="Nombre" value={form.nombre}
              onChange={handleChange} style={styles.input} />
            <input name="email" placeholder="Email" value={form.email}
              onChange={handleChange} style={styles.input} />
            <input name="ciudad" placeholder="Ciudad" value={form.ciudad}
              onChange={handleChange} style={styles.input} />
            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? "Guardando..." : "Agregar"}
            </button>
          </div>
          {msg && <p style={styles.msg}>{msg}</p>}
        </form>

        {/* Tabla */}
        <div style={styles.table}>
          <div style={styles.thead}>
            <span>ID</span><span>Nombre</span><span>Email</span><span>Ciudad</span>
          </div>
          {clientes.length === 0 && (
            <p style={{ padding: 16, color: "#64748b" }}>Sin clientes registrados.</p>
          )}
          {clientes.map((c) => (
            <motion.div key={c.id} style={styles.trow}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span>#{c.id}</span>
              <span>{c.nombre}</span>
              <span>{c.email}</span>
              <span>{c.ciudad}</span>
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
  form: { background: "#1e293b", borderRadius: 10, padding: "20px 24px", marginBottom: 24 },
  formTitle: { margin: "0 0 14px", color: "#94a3b8", fontSize: 15 },
  row: { display: "flex", gap: 12, flexWrap: "wrap" },
  input: {
    flex: "1 1 160px", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #334155", background: "#0f172a",
    color: "#e2e8f0", fontSize: 14, outline: "none",
  },
  btn: {
    padding: "10px 22px", background: "#38bdf8", color: "#0f172a",
    border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer",
  },
  msg: { marginTop: 10, fontSize: 14, color: "#4ade80" },
  table: { background: "#1e293b", borderRadius: 10, overflow: "hidden" },
  thead: {
    display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr",
    padding: "10px 16px", background: "#0f172a",
    color: "#64748b", fontSize: 13, fontWeight: "bold",
  },
  trow: {
    display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr",
    padding: "10px 16px", borderTop: "1px solid #0f172a", fontSize: 14,
  },
};
