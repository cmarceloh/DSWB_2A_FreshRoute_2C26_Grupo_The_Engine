const Pedido = require("../models/Pedido");
const ErrorDeValidacion = require("../models/ErrorDeValidacion");
const ErrorNoEncontrado = require("../models/ErrorNoEncontrado");
// Registra los modelos referidos para que populate esté disponible al usar la API de pedidos.
require("../models/Cliente");
require("../models/Producto");
require("../models/Repartidor");

// Los errores lanzados acá los atrapa el middleware de errores (Express 5 captura promesas rechazadas).

// Agrega a una consulta de pedidos los datos de sus relaciones
const poblarPedido = (consulta) =>
  consulta
    .populate("idCliente", "nombre direccion telefono")
    .populate("idProductos", "nombre precio categoria")
    .populate("idRepartidor", "nombre telefono disponible");

// Escapa los caracteres especiales de regex para usar texto del usuario en un filtro
const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Obtener todos los pedidos con posibilidad de filtrar por estado e idCliente
exports.obtenerPedidos = async (req, res) => {
  const { estado, idCliente } = req.query;
  const filtro = {};

  // Filtro por estado del pedido (comparacion exacta sin distinguir mayusculas)
  if (estado) {
    filtro.estado = { $regex: `^${escaparRegex(estado)}$`, $options: "i" };
  }

  // Filtro por ID de cliente relacional
  if (idCliente) {
    filtro.idCliente = idCliente;
  }

  res.status(200).json(await poblarPedido(Pedido.find(filtro)));
};

// Obtener un pedido especifico por su ID de MongoDB
exports.obtenerPedidoPorId = async (req, res) => {
  const pedido = await poblarPedido(Pedido.findById(req.params.id));
  if (!pedido) throw new ErrorNoEncontrado("Pedido no encontrado");

  res.status(200).json(pedido);
};

// Crear un nuevo pedido validando que cliente, productos y repartidor existan
exports.crearPedido = async (req, res) => {
  const { idCliente, idProductos, idRepartidor, direccionEntrega } = req.body;

  // Validacion de campos obligatorios
  if (!idCliente || !idProductos) {
    throw new ErrorDeValidacion(
      "El pedido debe incluir idCliente e idProductos",
    );
  }

  if (!Array.isArray(idProductos) || idProductos.length === 0) {
    throw new ErrorDeValidacion("El pedido debe contener al menos un producto");
  }

  const nuevoPedido = await Pedido.crearConRelaciones({
    idCliente,
    idProductos,
    idRepartidor,
    direccionEntrega,
  });

  res
    .status(201)
    .json({ mensaje: "Pedido creado con exito", pedido: nuevoPedido });
};

// Cambiar el estado de un pedido aplicando las reglas de negocio
exports.cambiarEstado = async (req, res) => {
  const { nuevoEstado } = req.body;

  if (!nuevoEstado) {
    throw new ErrorDeValidacion("Debe indicar el nuevo estado del pedido");
  }

  const pedido = await Pedido.findById(req.params.id);
  if (!pedido) throw new ErrorNoEncontrado("Pedido no encontrado");

  // Se ejecuta el metodo personalizado del modelo para validar las transiciones de estado
  pedido.actualizarEstado(nuevoEstado);
  await pedido.save();

  res.status(200).json({ mensaje: "Estado actualizado exitosamente", pedido });
};
