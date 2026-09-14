const ErrorDeValidacion = require("./ErrorDeValidacion");

class Producto {
  constructor(nombre, precio, stock, categoria) {
    this.id = Date.now();
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
    this.categoria = categoria;
  }

  // Método para actualizar datos generales del producto
  actualizarDatos(nuevosDatos) {
    const { nombre, precio, stock, categoria } = nuevosDatos;

    if (nombre) this.nombre = nombre;
    if (precio !== undefined) this.precio = precio;
    if (stock !== undefined) this.stock = stock;
    if (categoria) this.categoria = categoria;
  }

  // Método para ajustar el stock (suma o resta según la cantidad recibida)
  ajustarStock(cantidad) {
    const nuevoStock = this.stock + cantidad;

    if (nuevoStock < 0) {
      throw new ErrorDeValidacion(
        "No hay stock suficiente para realizar el ajuste",
      );
    }

    this.stock = nuevoStock;
  }
}

module.exports = Producto;
