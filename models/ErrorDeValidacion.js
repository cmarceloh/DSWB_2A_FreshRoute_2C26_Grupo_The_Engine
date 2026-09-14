// Error para reglas de negocio esperadas (ej. transición de estado inválida,
// stock insuficiente). Permite a los controllers distinguirlo de un error
// inesperado y responder 400 en vez de 500.
class ErrorDeValidacion extends Error {}

module.exports = ErrorDeValidacion;
