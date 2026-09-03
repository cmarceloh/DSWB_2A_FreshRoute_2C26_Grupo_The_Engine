class Pedido {
  constructor(idCliente, idProductos, idRepartidor) {
    this.id = Date.now(); // Genera un ID único básico
    this.idCliente = idCliente;
    this.idProductos = idProductos; // Array de IDs de productos
    this.idRepartidor = idRepartidor;
    this.estado = "Pendiente"; // Estado inicial por defecto
  }

  // Método para validar transiciones de estado
  actualizarEstado(nuevoEstado) {
    const estadosValidos = [
      "Pendiente",
      "Preparado",
      "En camino",
      "Entregado",
      "Cancelado",
    ];

    if (!estadosValidos.includes(nuevoEstado)) {
      throw new Error("Estado no válido");
    }
    if (this.estado === "Entregado" && nuevoEstado === "Pendiente") {
      throw new Error("Un pedido entregado no puede volver a pendiente");
    }
    if (this.estado === "Cancelado" && nuevoEstado === "En camino") {
      throw new Error("Un pedido cancelado no puede ser enviado");
    }

    this.estado = nuevoEstado;
  }
}

module.exports = Pedido;
