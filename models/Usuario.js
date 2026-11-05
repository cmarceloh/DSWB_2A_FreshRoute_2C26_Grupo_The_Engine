const mongoose = require("mongoose");

// Definición del esquema para la colección Usuarios (operadores del sistema)
// Siguiendo el módulo D10 (Autenticación, cookies y sesiones): nunca se guarda
// la contraseña en texto plano, sino su hash generado con bcrypt.
const usuarioSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "El nombre de usuario es obligatorio"],
      trim: true,
      unique: true,
      minlength: [3, "El nombre de usuario debe tener al menos 3 caracteres"],
    },
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "El hash de contraseña es obligatorio"],
    },
  },
  {
    timestamps: true,
  },
);

// Oculta el passwordHash y metadatos internos al serializar el usuario a JSON (D10, pág. 24)
usuarioSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

module.exports = mongoose.model("Usuario", usuarioSchema);
