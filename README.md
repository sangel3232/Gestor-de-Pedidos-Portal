# Gestor-de-Pedidos-Portal
#  Gestor de Pedidos — Plataforma Multiciudad de Gestión Comercial

##  1. Problema

Muchas pequeñas y medianas empresas gestionan pedidos de forma manual o con sistemas poco integrados, lo que genera:

- Pérdida de información  
- Falta de trazabilidad  
- Errores en confirmaciones  
- Demoras en procesamiento  
- Dificultad para escalar a múltiples ciudades  

---

##  2. Solución

**Gestor de Pedidos** es una plataforma web que permite:

- Registrar clientes  
- Crear pedidos  
- Consultar pedidos por ciudad y estado  
- Gestionar confirmaciones  
- Simular pagos  
- Notificar cambios de estado  

Actualmente el MVP incluye un CRUD funcional desarrollado en Spring Boot.

---

##  3. Diferenciador Tecnológico

- Arquitectura basada en microservicios (evolutiva)  
- Escalable a múltiples ciudades  
- Preparado para implementar:
  - CQRS (separación lectura/escritura)  
  - Redis para consultas rápidas  
  - Patrón SAGA para procesos de pedido + pago resilientes  
- Arquitectura distribuida preparada para crecimiento  

---

##  4. Arquitectura Propuesta

### Backend
- Spring Boot  
- Microservicios planificados:
  - Auth  
  - Clientes / Administrador 
  - Pedidos  
  - Pagos (mock)  
  - Notificaciones  

### Base de Datos
- PostgreSQL (fase final)  
- H2 (MVP actual en desarrollo)  

### Caché
- Redis (fase siguiente)

### Interfaz
- Web (PWA futura)

### Mensajería (fase avanzada)
- Arquitectura basada en eventos  

---

##  5. Alcance del MVP

### ✔ Registro de usuarios
Roles:
- ADMIN  
- VENDEDOR  
- CLIENTE  

### ✔ Gestión de pedidos
- Crear pedido  
- Consultar pedidos  
- Eliminar pedido  
- Actualizar estado  

### ✔ Búsqueda
- Por ciudad  
- Por cliente  
- Por estado  
- Por fecha  

### ✔ Confirmación de pedido
- HOLD temporal  
- Confirmación  
- Pago simulado  

### ✔ Notificaciones
- Cambio de estado del pedido  
- Confirmación de creación  

---

##  6. Implementación Técnica Actual (Avance Real)

Actualmente se tiene:

- Proyecto Spring Boot funcional  
- Arquitectura en capas:
  - `model`
  - `repository`
  - `controller`
- CRUD funcional de pedidos  
- Base de datos en memoria (H2)  
- Servidor activo en puerto 8080