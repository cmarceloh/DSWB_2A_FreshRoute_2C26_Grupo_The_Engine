const mongoose = require("mongoose");
const ErrorDeValidacion = require("./ErrorDeValidacion");
const ErrorNoEncontrado = require("./ErrorNoEncontrado");

const ESTADOS = ["Pendiente", "Preparado", "En camino", "Entregado", "Cancelado"];
const ESTADOS_ACTIVOS = ["Pendiente", "Preparado", "En camino"];

// Definición del esquema para la colección Pedidos
const pedidoSchema = new mongoose.Schema(
  {
    idCliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: [true, "El ID de cliente es obligatorio"],
    },
    idProductos: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Producto" }],
      validate: {
        validator: (productos) => productos.length > 0,
        message: "El pedido debe contener al menos un producto",
      },
    },
    // Se calcula a partir de los precios de los productos al crear el pedido.
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
        values: ESTADOS,
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
  if (!ESTADOS.includes(nuevoEstado)) {
    throw new ErrorDeValidacion("Estado no válido");
  }

  if (this.estado === "Entregado" && nuevoEstado === "Pendiente") {
    throw new ErrorDeValidacion(
      "Un pedido entregado no puede volver a pendiente",
    );
  }

  if (this.estado === "Cancelado" && nuevoEstado === "En camino") {
    throw new ErrorDeValidacion("Un pedido cancelado no puede ser enviado");
  }

  this.estado = nuevoEstado;
};

// Indica si existe algún pedido activo que cumpla el filtro (ej. de un cliente o producto)
pedidoSchema.statics.existenActivos = function (filtro) {
  return this.exists({ ...filtro, estado: { $in: ESTADOS_ACTIVOS } });
};

// Crea un pedido verificando que cliente, productos y repartidor existan.
// Calcula el monto total con los precios de los productos y, si no se indica
// dirección de entrega, usa la del cliente. Lanza ErrorNoEncontrado si falta algún registro.
pedidoSchema.statics.crearConRelaciones = async function ({
  idCliente,
  idProductos,
  idRepartidor,
  direccionEntrega,
}) {
  const Cliente = require("./Cliente");
  const Producto = require("./Producto");
  const Repartidor = require("./Repartidor");

  const cliente = await Cliente.findById(idCliente);
  if (!cliente) {
    throw new ErrorNoEncontrado("El cliente indicado no existe");
  }

  const idsUnicos = [...new Set(idProductos.map(String))];
  const productos = await Producto.find({ _id: { $in: idsUnicos } });
  if (productos.length !== idsUnicos.length) {
    throw new ErrorNoEncontrado("Alguno de los productos indicados no existe");
  }

  if (idRepartidor && !(await Repartidor.exists({ _id: idRepartidor }))) {
    throw new ErrorNoEncontrado("El repartidor indicado no existe");
  }

  const precios = new Map(productos.map((p) => [String(p._id), p.precio]));
  const montoTotal = idProductos.reduce((suma, id) => suma + precios.get(String(id)), 0);

  return this.create({
    idCliente,
    idProductos,
    idRepartidor: idRepartidor || null,
    montoTotal,
    direccionEntrega: direccionEntrega?.trim() || cliente.direccion,
  });
};

module.exports = mongoose.model("Pedido", pedidoSchema);
