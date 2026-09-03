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

// Controlador para obtener todos los pedidos
const obtenerPedidos = (req, res) => {
  const db = leerDB();
  res.json(db.pedidos);
};

// Controlador para crear un pedido
const crearPedido = (req, res) => {
  const { idCliente, idProductos, idRepartidor } = req.body;

  // Regla de negocio: Un pedido debe contener al menos un producto
  if (!idProductos || idProductos.length === 0) {
    return res
      .status(400)
      .json({ error: "El pedido debe contener al menos un producto" });
  }

  const nuevoPedido = new Pedido(idCliente, idProductos, idRepartidor);

  const db = leerDB();
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

  // Buscar la posición del pedido en el array
  const pedidoIndex = db.pedidos.findIndex((p) => p.id === id);
  if (pedidoIndex === -1) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  // Instanciar la clase Pedido (POO) con los datos guardados
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
    // Si el estado es inválido se captura el Error de la clase
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  obtenerPedidos,
  crearPedido,
  cambiarEstado,
};
