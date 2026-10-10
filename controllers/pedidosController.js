const Pedido = require("../models/Pedido");
const Cliente = require("../models/Cliente");
const Producto = require("../models/Producto");
// Registra el modelo referido para que populate esté disponible al usar la API de pedidos.
require("../models/Repartidor");

// Obtener todos los pedidos con posibilidad de filtrar por estado e idCliente
exports.obtenerPedidos = async (req, res) => {
  try {
    const { estado, idCliente } = req.query;
    const filtro = {};

    // Filtro por estado del pedido
    if (estado) {
      filtro.estado = { $regex: `^${estado}$`, $options: "i" };
    }

    // Filtro por ID de cliente relacional
    if (idCliente) {
      filtro.idCliente = idCliente;
    }

    // Poblar las relaciones con los modelos de Cliente, Productos y Repartidor
    const pedidos = await Pedido.find(filtro)
      .populate("idCliente", "nombre direccion telefono")
      .populate("idProductos", "nombre precio categoria")
      .populate("idRepartidor", "nombre telefono disponible");

    res.status(200).json(pedidos);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al obtener la lista de pedidos",
        detalle: error.message,
      });
  }
};

// Obtener un pedido especifico por su ID de MongoDB
exports.obtenerPedidoPorId = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate("idCliente", "nombre direccion telefono")
      .populate("idProductos", "nombre precio categoria")
      .populate("idRepartidor", "nombre telefono disponible");

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.status(200).json(pedido);
  } catch (error) {
    res
      .status(400)
      .json({ error: "ID de pedido no valido", detalle: error.message });
  }
};

// Crear un nuevo pedido validando que el cliente exista en la base de datos
exports.crearPedido = async (req, res) => {
  try {
    const { idCliente, idProductos, idRepartidor } = req.body;

    // Validacion de campos obligatorios
    if (!idCliente || !idProductos) {
      return res
        .status(400)
        .json({ error: "El pedido debe incluir idCliente e idProductos" });
    }

    if (!Array.isArray(idProductos) || idProductos.length === 0) {
      return res
        .status(400)
        .json({ error: "El pedido debe contener al menos un producto" });
    }

    // Verificacion de existencia del cliente relacionado
    const clienteExiste = await Cliente.findById(idCliente);
    if (!clienteExiste) {
      return res
        .status(404)
        .json({ error: "El cliente indicado no existe en la base de datos" });
    }

    const nuevoPedido = new Pedido({
      idCliente,
      idProductos,
      idRepartidor: idRepartidor || null,
    });

    await nuevoPedido.save();

    res
      .status(201)
      .json({ mensaje: "Pedido creado con exito", pedido: nuevoPedido });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al crear el pedido", detalle: error.message });
  }
};

// Cambiar el estado de un pedido aplicando las reglas de negocio
exports.cambiarEstado = async (req, res) => {
  try {
    const { nuevoEstado } = req.body;

    if (!nuevoEstado) {
      return res
        .status(400)
        .json({ error: "Debe indicar el nuevo estado del pedido" });
    }

    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // Se ejecuta el metodo personalizado del modelo para validar las transiciones de estado
    pedido.actualizarEstado(nuevoEstado);
    await pedido.save();

    res
      .status(200)
      .json({ mensaje: "Estado actualizado exitosamente", pedido });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
