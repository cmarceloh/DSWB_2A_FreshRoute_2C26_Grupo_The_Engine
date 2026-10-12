// Importa el modelo que persiste los repartidores en MongoDB.
const Repartidor = require("../models/Repartidor");
const ErrorDeValidacion = require("../models/ErrorDeValidacion");
const ErrorNoEncontrado = require("../models/ErrorNoEncontrado");

// Los errores lanzados acá los atrapa el middleware de errores (Express 5 captura promesas rechazadas).

// Devuelve todos los repartidores ordenados por nombre.
exports.getRepartidores = async (req, res) => {
  res.status(200).json(await Repartidor.find().sort({ nombre: 1 }));
};

// Busca un repartidor por su identificador de MongoDB.
exports.getRepartidorById = async (req, res) => {
  const repartidor = await Repartidor.findById(req.params.id);
  if (!repartidor) throw new ErrorNoEncontrado("Repartidor no encontrado");

  res.status(200).json(repartidor);
};

// Valida los datos requeridos y crea un nuevo repartidor.
exports.createRepartidor = async (req, res) => {
  const { nombre, telefono, vehiculo } = req.body;
  if (!nombre?.trim() || !telefono?.trim() || !vehiculo?.trim()) {
    throw new ErrorDeValidacion(
      "El repartidor debe tener nombre, teléfono y vehículo",
    );
  }

  const repartidor = await Repartidor.create({ nombre, telefono, vehiculo });
  res.status(201).json({
    mensaje: "Repartidor creado con éxito",
    repartidor,
  });
};

// Actualiza los campos enviados para un repartidor existente.
exports.updateRepartidor = async (req, res) => {
  const { nombre, telefono, vehiculo, disponible } = req.body;
  const actualizacion = {};

  if (nombre !== undefined) actualizacion.nombre = nombre;
  if (telefono !== undefined) actualizacion.telefono = telefono;
  if (vehiculo !== undefined) actualizacion.vehiculo = vehiculo;
  if (disponible !== undefined) actualizacion.disponible = disponible;

  const repartidor = await Repartidor.findByIdAndUpdate(
    req.params.id,
    actualizacion,
    { new: true, runValidators: true },
  );
  if (!repartidor) throw new ErrorNoEncontrado("Repartidor no encontrado");

  res.status(200).json({
    mensaje: "Repartidor actualizado exitosamente",
    repartidor,
  });
};

// Elimina un repartidor por su identificador de MongoDB.
exports.deleteRepartidor = async (req, res) => {
  const repartidor = await Repartidor.findByIdAndDelete(req.params.id);
  if (!repartidor) throw new ErrorNoEncontrado("Repartidor no encontrado");

  res.status(200).json({
    mensaje: "Repartidor eliminado exitosamente",
    repartidor,
  });
};
