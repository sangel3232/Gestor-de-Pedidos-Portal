import axios from "axios";

const api = axios.create({ baseURL: "" });

// Clientes
export const getClientes = () => api.get("/clientes");
export const crearCliente = (data) => api.post("/clientes", data);

// Pedidos
export const getPedidos = () => api.get("/pedidos");
export const getPedidosPorEstado = (estado) => api.get(`/pedidos/estado/${estado}`);
export const crearPedido = (data) => api.post("/pedidos", data);
export const eliminarPedido = (id) => api.delete(`/pedidos/${id}`);
