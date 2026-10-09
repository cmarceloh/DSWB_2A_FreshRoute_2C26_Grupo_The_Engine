const Cliente = require("../models/Cliente");
const Pedido = require("../models/Pedido");

// Controlador para obtener todos los clientes (con filtro opcional por query param)
const obtenerClientes = async (req, res) => {
  try {
    const { nombre } = req.query;
    const filtro = {};

    // Busqueda parcial por nombre sin importar mayusculas o minusculas
    if (nombre) {
      filtro.nombre = { $regex: nombre, $options: "i" };
    }

    const clientes = await Cliente.find(filtro);
    res.status(200).json(clientes);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al obtener la lista de clientes",
        detalle: error.message,
      });
  }
};

// Controlador para obtener un cliente por ID de MongoDB
const obtenerClientePorId = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.status(200).json(cliente);
  } catch (error) {
    res
      .status(400)
      .json({ error: "ID de cliente no valido", detalle: error.message });
  }
};

// Controlador para crear un cliente
const crearCliente = async (req, res) => {
  try {
    const { nombre, telefono, direccion } = req.body;

    // Validacion: campos obligatorios
    if (!nombre || !telefono) {
      return res
        .status(400)
        .json({ error: "El cliente debe tener nombre y telefono" });
    }

    // Validacion: no permitir dos clientes con el mismo telefono
    const telefonoDuplicado = await Cliente.findOne({ telefono });
    if (telefonoDuplicado) {
      return res
        .status(409)
        .json({ error: "Ya existe un cliente registrado con ese telefono" });
    }

    const nuevoCliente = new Cliente({ nombre, telefono, direccion });
    await nuevoCliente.save();

    res
      .status(201)
      .json({ mensaje: "Cliente creado con exito", cliente: nuevoCliente });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al crear el cliente", detalle: error.message });
  }
};

// Controlador para actualizar datos de un cliente
const actualizarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Ejecutar el metodo personalizado de la clase/esquema para actualizar los datos
    cliente.actualizarDatos(req.body);
    await cliente.save();

    res.status(200).json({
      mensaje: "Cliente actualizado exitosamente",
      cliente,
    });
  } catch (error) {
    res
      .status(400)
      .json({
        error: "Error al actualizar el cliente",
        detalle: error.message,
      });
  }
};

// Controlador para eliminar un cliente
const eliminarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Regla de negocio: no se puede eliminar un cliente que tiene pedidos activos
    const estadosActivos = ["Pendiente", "Preparado", "En camino"];
    const tienePedidosActivos = await Pedido.findOne({
      idCliente: req.params.id,
      estado: { $in: estadosActivos },
    });

    if (tienePedidosActivos) {
      return res.status(409).json({
        error: "No se puede eliminar un cliente con pedidos activos",
      });
    }

    await Cliente.findByIdAndDelete(req.params.id);

    res.status(200).json({
      mensaje: "Cliente eliminado exitosamente",
      cliente,
    });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al eliminar el cliente", detalle: error.message });
  }
};

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};
