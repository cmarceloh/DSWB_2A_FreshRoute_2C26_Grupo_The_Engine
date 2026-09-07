const fs = require("fs");
const path = require("path");
const Pedido = require("../models/Pedido");

// Ruta absoluta al archivo JSON
const dbPath = path.join(__dirname, "../data/database.json");

// Función auxiliar para leer la base de datos
const leerDB = () => {
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data);
};

// Función auxiliar para escribir en la base de datos
const escribirDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
};

// Controlador para obtener todos los pedidos (con filtros opcionales por query params)
const obtenerPedidos = (req, res) => {
  const db = leerDB();
  const { estado, idCliente } = req.query;
  let resultado = db.pedidos;

  // Consulta: filtrar pedidos por estado
  if (estado) {
    resultado = resultado.filter(
      (p) => p.estado.toLowerCase() === estado.toLowerCase(),
    );
  }

  // Consulta: filtrar pedidos por cliente
  if (idCliente) {
    resultado = resultado.filter((p) => p.idCliente === parseInt(idCliente));
  }

  res.json(resultado);
};

// Controlador para obtener un pedido por ID
const obtenerPedidoPorId = (req, res) => {
  const id = parseInt(req.params.id);
  const db = leerDB();

  const pedido = db.pedidos.find((p) => p.id === id);
  if (!pedido) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  res.json(pedido);
};

// Controlador para crear un pedido
const crearPedido = (req, res) => {
  const { idCliente, idProductos, idRepartidor } = req.body;

  // Validación: campos obligatorios
  if (!idCliente || !idProductos) {
    return res
      .status(400)
      .json({ error: "El pedido debe incluir idCliente e idProductos" });
  }

  // Validación: tipos de datos
  if (typeof idCliente !== "number") {
    return res.status(400).json({ error: "idCliente debe ser un número" });
  }
  if (!Array.isArray(idProductos) || idProductos.length === 0) {
    return res
      .status(400)
      .json({ error: "El pedido debe contener al menos un producto" });
  }

  const db = leerDB();

  // Validación: existencia de registro relacionado (el cliente debe existir)
  const clienteExiste = db.clientes.some((c) => c.id === idCliente);
  if (!clienteExiste) {
    return res
      .status(404)
      .json({ error: "El cliente indicado no existe" });
  }

  const nuevoPedido = new Pedido(idCliente, idProductos, idRepartidor);

  db.pedidos.push(nuevoPedido);
  escribirDB(db);

  res
    .status(201)
    .json({ mensaje: "Pedido creado con éxito", pedido: nuevoPedido });
};

// Controlador para cambiar el estado de un pedido
const cambiarEstado = (req, res) => {
  const id = parseInt(req.params.id); // Captura el ID de la ruta
  const { nuevoEstado } = req.body; // Captura el estado enviado en formato JSON
  const db = leerDB();

  // Validación: campo obligatorio
  if (!nuevoEstado) {
    return res.status(400).json({ error: "Debe indicar el nuevo estado" });
  }

  // Buscar la posición del pedido en el array
  const pedidoIndex = db.pedidos.findIndex((p) => p.id === id);
  if (pedidoIndex === -1) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  // Instanciar la clase Pedido con los datos guardados
  const datosGuardados = db.pedidos[pedidoIndex];
  const pedidoActivo = new Pedido(
    datosGuardados.idCliente,
    datosGuardados.idProductos,
    datosGuardados.idRepartidor,
  );
  pedidoActivo.id = datosGuardados.id;
  pedidoActivo.estado = datosGuardados.estado;

  // Ejecutar el método de la clase para validar transiciones
  try {
    pedidoActivo.actualizarEstado(nuevoEstado);

    // Si la validación es correcta, actualizar el array y sobrescribir el JSON
    db.pedidos[pedidoIndex] = pedidoActivo;
    escribirDB(db);

    res.json({
      mensaje: "Estado actualizado exitosamente",
      pedido: pedidoActivo,
    });
  } catch (error) {
    // Si el estado es inválido o la transición no está permitida
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  obtenerPedidos,
  obtenerPedidoPorId,
  crearPedido,
  cambiarEstado,
};