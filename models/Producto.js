const mongoose = require("mongoose");
const ErrorDeValidacion = require("./ErrorDeValidacion");

// Definición del esquema para la colección Productos
const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
      trim: true,
    },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      validate: {
        validator: (valor) => valor > 0,
        message: "El precio debe ser mayor a cero",
      },
    },
    stock: {
      type: Number,
      required: [true, "El stock es obligatorio"],
      min: [0, "El stock no puede ser negativo"],
      default: 0,
    },
    categoria: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Genera automáticamente los campos createdAt y updatedAt
  },
);

// El nombre es único sin distinguir mayúsculas ni minúsculas
productoSchema.index(
  { nombre: 1 },
  { unique: true, collation: { locale: "es", strength: 2 } },
);

// Método de instancia para actualizar datos generales del producto
productoSchema.methods.actualizarDatos = function (nuevosDatos) {
  const { nombre, precio, stock, categoria } = nuevosDatos;

  if (nombre) this.nombre = nombre;
  if (precio !== undefined) this.precio = precio;
  if (stock !== undefined) this.stock = stock;
  if (categoria) this.categoria = categoria;
};

// Método de instancia para ajustar el stock (suma o resta según la cantidad recibida)
productoSchema.methods.ajustarStock = function (cantidad) {
  const nuevoStock = this.stock + cantidad;

  if (nuevoStock < 0) {
    throw new ErrorDeValidacion(
      "No hay stock suficiente para realizar el ajuste",
    );
  }

  this.stock = nuevoStock;
};

module.exports = mongoose.model("Producto", productoSchema);
