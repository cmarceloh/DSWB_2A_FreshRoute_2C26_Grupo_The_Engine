const mongoose = require("mongoose");

// Definición del esquema para la colección Clientes
const clienteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true, // Elimina espacios en blanco innecesarios al inicio y final
    },
    telefono: {
      type: String,
      trim: true,
    },
    direccion: {
      type: String,
      required: [true, "La dirección es obligatoria"],
      trim: true,
    },
  },
  {
    timestamps: true, // Genera automáticamente los campos createdAt y updatedAt
  },
);

// Método de instancia para actualizar datos de contacto
clienteSchema.methods.actualizarDatos = function (nuevosDatos) {
  const { nombre, telefono, direccion } = nuevosDatos;

  if (nombre) this.nombre = nombre;
  if (telefono) this.telefono = telefono;
  if (direccion) this.direccion = direccion;
};

module.exports = mongoose.model("Cliente", clienteSchema);
