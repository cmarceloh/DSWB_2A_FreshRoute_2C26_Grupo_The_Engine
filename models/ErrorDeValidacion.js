// Error para reglas de negocio o datos inválidos esperados (ej. transición de
// estado inválida, stock insuficiente). El middleware de errores lo responde con 400.
class ErrorDeValidacion extends Error {}

module.exports = ErrorDeValidacion;
