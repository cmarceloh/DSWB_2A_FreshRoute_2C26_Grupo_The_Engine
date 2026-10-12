// Error para conflictos con una regla de negocio (ej. borrar un cliente con
// pedidos activos). El middleware de errores lo responde con 409.
class ErrorDeConflicto extends Error {}

module.exports = ErrorDeConflicto;
