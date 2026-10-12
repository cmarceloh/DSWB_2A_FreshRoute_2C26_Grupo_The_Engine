const Cliente = require("../models/Cliente");
const Pedido = require("../models/Pedido");
const ErrorDeValidacion = require("../models/ErrorDeValidacion");
const ErrorNoEncontrado = require("../models/ErrorNoEncontrado");
const ErrorDeConflicto = require("../models/ErrorDeConflicto");

// Los errores lanzados acá los atrapa el middleware de errores (Express 5 captura promesas rechazadas).

// Busca un cliente por ID o lanza ErrorNoEncontrado
const buscarCliente = async (id) => {
  const cliente = await Cliente.findById(id);
  if (!cliente) throw new ErrorNoEncontrado("Cliente no encontrado");
  return cliente;
};

// Escapa los caracteres especiales de regex para usar texto del usuario en un filtro
const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Controlador para obtener todos los clientes (con filtro opcional por query param)
const obtenerClientes = async (req, res) => {
  const { nombre } = req.query;
  const filtro = {};

  // Busqueda parcial por nombre sin importar mayusculas o minusculas
  if (nombre) {
    filtro.nombre = { $regex: escaparRegex(nombre), $options: "i" };
  }

  res.status(200).json(await Cliente.find(filtro));
};

// Controlador para obtener un cliente por ID de MongoDB
const obtenerClientePorId = async (req, res) => {
  res.status(200).json(await buscarCliente(req.params.id));
};

// Controlador para crear un cliente
const crearCliente = async (req, res) => {
  const { nombre, telefono, direccion } = req.body;

  // Validacion: tipos de datos (los campos obligatorios los valida el schema)
  if (
    [nombre, telefono, direccion].some(
      (valor) => valor !== undefined && typeof valor !== "string",
    )
  ) {
    throw new ErrorDeValidacion("Nombre, telefono y direccion deben ser texto");
  }

  // El telefono duplicado lo rechaza el indice unico (409 en el middleware)
  const nuevoCliente = await Cliente.create({ nombre, telefono, direccion });

  res
    .status(201)
    .json({ mensaje: "Cliente creado con exito", cliente: nuevoCliente });
};

// Controlador para actualizar datos de un cliente
const actualizarCliente = async (req, res) => {
  const cliente = await buscarCliente(req.params.id);

  // Ejecutar el metodo personalizado del esquema para actualizar los datos
  cliente.actualizarDatos(req.body);
  await cliente.save();

  res.status(200).json({
    mensaje: "Cliente actualizado exitosamente",
    cliente,
  });
};

// Controlador para eliminar un cliente
const eliminarCliente = async (req, res) => {
  const cliente = await buscarCliente(req.params.id);

  // Regla de negocio: no se puede eliminar un cliente que tiene pedidos activos
  if (await Pedido.existenActivos({ idCliente: cliente._id })) {
    throw new ErrorDeConflicto(
      "No se puede eliminar un cliente con pedidos activos",
    );
  }

  await cliente.deleteOne();

  res.status(200).json({
    mensaje: "Cliente eliminado exitosamente",
    cliente,
  });
};

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};
