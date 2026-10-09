const mongoose = require("mongoose");

// Definición del esquema para la colección Repartidores
const repartidorSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del repartidor es obligatorio"],
      trim: true,
    },
    telefono: {
      type: String,
      trim: true,
    },
    disponible: {
      type: Boolean,
      default: true, // Estado por defecto para saber si puede tomar pedidos
    },
  },
  {
    timestamps: true, // Genera automáticamente los campos createdAt y updatedAt
  },
);

// Método de instancia para actualizar la disponibilidad del repartidor
repartidorSchema.methods.cambiarDisponibilidad = function (estado) {
  this.disponible = estado;
};

module.exports = mongoose.model("Repartidor", repartidorSchema);
