// Importa el modelo que persiste los repartidores en MongoDB.
const Repartidor = require("../models/Repartidor");

// Devuelve todos los repartidores ordenados por nombre.
exports.getRepartidores = async (req, res) => {
  try {
    const repartidores = await Repartidor.find().sort({ nombre: 1 });
    res.status(200).json(repartidores);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener la lista de repartidores",
      detalle: error.message,
    });
  }
};

// Busca un repartidor por su identificador de MongoDB.
exports.getRepartidorById = async (req, res) => {
  try {
    const repartidor = await Repartidor.findById(req.params.id);
    if (!repartidor) {
      return res.status(404).json({ error: "Repartidor no encontrado" });
    }
    res.status(200).json(repartidor);
  } catch (error) {
    res.status(400).json({
      error: "ID de repartidor no válido",
      detalle: error.message,
    });
  }
};

// Valida los datos requeridos y crea un nuevo repartidor.
exports.createRepartidor = async (req, res) => {
  try {
    const { nombre, telefono, vehiculo } = req.body;
    if (!nombre?.trim() || !telefono?.trim() || !vehiculo?.trim()) {
      return res.status(400).json({
        error: "El repartidor debe tener nombre, teléfono y vehículo",
      });
    }

    const repartidor = await Repartidor.create({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      vehiculo: vehiculo.trim(),
    });
    res.status(201).json({
      mensaje: "Repartidor creado con éxito",
      repartidor,
    });
  } catch (error) {
    res.status(400).json({
      error: "Error al crear el repartidor",
      detalle: error.message,
    });
  }
};

// Actualiza los campos enviados para un repartidor existente.
exports.updateRepartidor = async (req, res) => {
  try {
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
    if (!repartidor) {
      return res.status(404).json({ error: "Repartidor no encontrado" });
    }

    res.status(200).json({
      mensaje: "Repartidor actualizado exitosamente",
      repartidor,
    });
  } catch (error) {
    res.status(400).json({
      error: "Error al actualizar el repartidor",
      detalle: error.message,
    });
  }
};

// Elimina un repartidor por su identificador de MongoDB.
exports.deleteRepartidor = async (req, res) => {
  try {
    const repartidor = await Repartidor.findByIdAndDelete(req.params.id);
    if (!repartidor) {
      return res.status(404).json({ error: "Repartidor no encontrado" });
    }

    res.status(200).json({
      mensaje: "Repartidor eliminado exitosamente",
      repartidor,
    });
  } catch (error) {
    res.status(400).json({
      error: "Error al eliminar el repartidor",
      detalle: error.message,
    });
  }
};
