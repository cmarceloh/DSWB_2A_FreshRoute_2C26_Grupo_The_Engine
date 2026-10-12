const ErrorDeValidacion = require("../models/ErrorDeValidacion");
const ErrorNoEncontrado = require("../models/ErrorNoEncontrado");
const ErrorDeConflicto = require("../models/ErrorDeConflicto");

// Traduce cualquier error a un código HTTP y un mensaje para el cliente.
// Lo usan tanto el middleware de la API como el panel Pug.
const traducirError = (err) => {
  if (err instanceof ErrorNoEncontrado) {
    return { status: 404, mensaje: err.message };
  }
  if (err instanceof ErrorDeConflicto) {
    return { status: 409, mensaje: err.message };
  }
  if (err instanceof ErrorDeValidacion) {
    return { status: 400, mensaje: err.message };
  }
  // Fallo de las validaciones del schema de Mongoose
  if (err.name === "ValidationError") {
    const mensajes = Object.values(err.errors).map((e) => e.message);
    return { status: 400, mensaje: mensajes.join(". ") };
  }
  // ID con formato inválido (ObjectId mal formado)
  if (err.name === "CastError") {
    return { status: 400, mensaje: `Valor no válido para ${err.path}` };
  }
  // Clave duplicada en un índice único de MongoDB
  if (err.code === 11000) {
    const campo = Object.keys(err.keyPattern || {})[0] || "valor";
    return { status: 409, mensaje: `Ya existe un registro con ese ${campo}` };
  }
  // JSON malformado en el body de la petición
  if (err.type === "entity.parse.failed") {
    return { status: 400, mensaje: "El cuerpo de la petición no es un JSON válido" };
  }
  return { status: 500, mensaje: "Error interno del servidor" };
};

// Middleware de errores de Express: debe registrarse después de todas las rutas.
const errorHandler = (err, req, res, next) => {
  const { status, mensaje } = traducirError(err);
  if (status === 500) console.error(err);
  res.status(status).json({ error: mensaje });
};

module.exports = { errorHandler, traducirError };
