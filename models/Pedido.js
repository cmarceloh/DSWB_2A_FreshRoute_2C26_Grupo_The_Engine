const mongoose = require("mongoose");

// Definición del esquema para la colección Pedidos
const pedidoSchema = new mongoose.Schema(
  {
    idCliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: [true, "El ID de cliente es obligatorio"],
    },
    idProductos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto",
        required: [true, "El pedido debe contener al menos un producto"],
      },
    ],
    // Datos adicionales capturados por los formularios del panel web.
    montoTotal: {
      type: Number,
      min: [0, "El monto total no puede ser negativo"],
    },
    direccionEntrega: {
      type: String,
      trim: true,
    },
    idRepartidor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repartidor",
      required: false,
      default: null,
    },
    estado: {
      type: String,
      enum: {
        values: [
          "Pendiente",
          "Preparado",
          "En camino",
          "Entregado",
          "Cancelado",
        ],
        message: "{VALUE} no es un estado permitido",
      },
      default: "Pendiente",
    },
  },
  {
    timestamps: true, // Genera automáticamente fecha de creación (createdAt) y actualización (updatedAt)
  },
);

// Método de instancia para validar transiciones de estado en el modelo
pedidoSchema.methods.actualizarEstado = function (nuevoEstado) {
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
};

module.exports = mongoose.model("Pedido", pedidoSchema);
