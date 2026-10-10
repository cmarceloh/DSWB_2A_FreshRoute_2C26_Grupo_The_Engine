const mongoose = require("mongoose");

// Define los datos de contacto, vehículo y disponibilidad de cada repartidor.
const repartidorSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del repartidor es obligatorio"],
      trim: true,
    },
    telefono: {
      type: String,
      required: [true, "El teléfono del repartidor es obligatorio"],
      trim: true,
    },
    vehiculo: {
      type: String,
      required: [true, "El vehículo del repartidor es obligatorio"],
      trim: true,
    },
    disponible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Permite cambiar la disponibilidad desde las reglas de negocio del modelo.
repartidorSchema.methods.cambiarDisponibilidad = function (estado) {
  this.disponible = estado;
};

module.exports = mongoose.model("Repartidor", repartidorSchema);
