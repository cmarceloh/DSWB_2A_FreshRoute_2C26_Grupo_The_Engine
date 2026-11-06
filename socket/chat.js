// Módulo de WebSockets (Socket.io) y Chatbot Asistente Logístico "FreshBot" (D12. Websockets)
const Pedido = require("../models/Pedido");
const Producto = require("../models/Producto");
const Repartidor = require("../models/Repartidor");
const Cliente = require("../models/Cliente");

// Historial en memoria de la sala de chat (D12, pág. 20)
const messages = [
  {
    author: "🤖 FreshBot",
    text: "¡Hola! Soy FreshBot, el asistente en tiempo real de FreshRoute. Escribí 'pedidos', 'stock', 'repartidores', 'clientes' o 'reglas' para consultar el estado en vivo de MongoDB Atlas.",
    isBot: true,
    timestamp: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
  },
];

// Motor de respuestas asincrónico del Chatbot consultando MongoDB Atlas en tiempo real
const generarRespuestaBot = async (textoUsuario) => {
  const texto = String(textoUsuario || "").toLowerCase().trim();

  try {
    if (
      texto.includes("pedido") ||
      texto.includes("estado") ||
      texto.includes("envio") ||
      texto.includes("envío")
    ) {
      const pedidos = await Pedido.find();
      if (!pedidos.length) {
        return "📦 Actualmente no hay pedidos registrados en la base de datos.";
      }
      const conteo = pedidos.reduce((acc, p) => {
        acc[p.estado] = (acc[p.estado] || 0) + 1;
        return acc;
      }, {});
      const facturacionTotal = pedidos.reduce((sum, p) => sum + (p.montoTotal || 0), 0);
      const resumenEstados = Object.entries(conteo)
        .map(([estado, cant]) => `${estado}: ${cant}`)
        .join(" | ");
      return `📦 Total de pedidos en MongoDB Atlas: ${pedidos.length} (${resumenEstados}). Monto total acumulado: $${facturacionTotal.toFixed(2)}.`;
    }

    if (texto.includes("stock") || texto.includes("producto") || texto.includes("catalogo") || texto.includes("catálogo")) {
      const productos = await Producto.find().sort({ stock: 1 });
      if (!productos.length) {
        return "🍎 No hay productos cargados en el catálogo actualmente.";
      }
      const menorStock = productos
        .slice(0, 3)
        .map((p) => `${p.nombre} (${p.stock} u.)`)
        .join(", ");
      return `🍎 Hay ${productos.length} productos activos en catálogo. Productos con menor stock actual: ${menorStock}.`;
    }

    if (texto.includes("repartidor") || texto.includes("flota") || texto.includes("vehiculo") || texto.includes("vehículo")) {
      const repartidores = await Repartidor.find();
      const disponibles = repartidores.filter((r) => r.disponible);
      if (!repartidores.length) {
        return "🛵 Todavía no hay repartidores registrados.";
      }
      const nombresDisp = disponibles.map((r) => `${r.nombre} (${r.vehiculo})`).join(", ") || "ninguno";
      return `🛵 Flota B2B: ${disponibles.length} de ${repartidores.length} repartidores disponibles (${nombresDisp}).`;
    }

    if (texto.includes("cliente")) {
      const clientes = await Cliente.find();
      if (!clientes.length) {
        return "👥 No hay clientes registrados en el sistema.";
      }
      const lista = clientes.slice(0, 4).map((c) => c.nombre).join(", ");
      return `👥 Total de clientes B2B registrados: ${clientes.length} (incluyendo a: ${lista}).`;
    }

    if (texto.includes("regla") || texto.includes("transicion") || texto.includes("transición")) {
      return "📋 Reglas de negocio FreshRoute: 1) Estados válidos: Pendiente → Preparado → En camino → Entregado (o Cancelado). 2) Un pedido Entregado no puede volver a Pendiente. 3) No se pueden eliminar clientes ni productos con pedidos activos.";
    }

    if (texto.includes("hola") || texto.includes("ayuda") || texto.includes("comando") || texto.includes("bot")) {
      return "👋 ¡Hola! Podés consultarme en tiempo real escribiendo: 'pedidos' (resumen de estados), 'stock' (inventario de productos), 'repartidores' (flota disponible), 'clientes' o 'reglas'.";
    }

    return null;
  } catch (_err) {
    return "⚠️ No pude consultar la base de datos en este momento, pero el canal de chat sigue activo.";
  }
};

// Procesa un mensaje entrante de un operador y, si corresponde, anexa la respuesta de FreshBot
const procesarNuevoMensaje = async (data) => {
  const author = String(data?.author || "Operador").trim() || "Operador";
  const text = String(data?.text || "").trim();

  if (!text) {
    return { messages, respuestaBot: null };
  }

  const timestamp = new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  messages.push({
    author,
    text,
    isBot: false,
    timestamp,
  });

  // Limitar historial en memoria a los últimos 40 mensajes
  if (messages.length > 40) {
    messages.shift();
  }

  const textoRespuesta = await generarRespuestaBot(text);
  let respuestaBot = null;

  if (textoRespuesta) {
    respuestaBot = {
      author: "🤖 FreshBot",
      text: textoRespuesta,
      isBot: true,
      timestamp: new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    messages.push(respuestaBot);
    if (messages.length > 40) {
      messages.shift();
    }
  }

  return { messages, respuestaBot };
};

// Configuración del servidor de WebSockets con Socket.io (D12, págs. 13-21)
const configurarSockets = (io) => {
  io.on("connection", (socket) => {
    // Enviar el historial actual al cliente que se acaba de conectar (evento unicast)
    socket.emit("messages", messages);

    // Escuchar nuevos mensajes desde cualquier cliente (D12, pág. 20)
    socket.on("new-message", async (data) => {
      await procesarNuevoMensaje(data);
      // Notificar a todos los clientes conectados en tiempo real (broadcast global D12, pág. 20-21)
      io.sockets.emit("messages", messages);
    });

    socket.on("disconnect", () => {
      // Evento disconnect cuando un navegador cierra la pestaña (D12, pág. 14)
    });
  });
};

module.exports = {
  messages,
  generarRespuestaBot,
  procesarNuevoMensaje,
  configurarSockets,
};
