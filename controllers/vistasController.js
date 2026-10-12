// Controladores del panel web. Reutilizan los mismos modelos y reglas de negocio
// que la API; ante un error redirigen al panel mostrando el mensaje.
const Cliente = require("../models/Cliente");
const Producto = require("../models/Producto");
const Pedido = require("../models/Pedido");
const Repartidor = require("../models/Repartidor");
const ErrorDeConflicto = require("../models/ErrorDeConflicto");
const ErrorNoEncontrado = require("../models/ErrorNoEncontrado");
const { traducirError } = require("../middlewares/errorHandler");

const redirigirConError = (res, mensaje) =>
  res.redirect(`/?error=${encodeURIComponent(mensaje)}`);

// Envuelve una acción del panel: si termina bien vuelve al panel, si falla muestra el error.
const accion = (funcion) => async (req, res) => {
  try {
    await funcion(req);
    res.redirect("/");
  } catch (error) {
    const { status, mensaje } = traducirError(error);
    if (status === 500) console.error(error);
    redirigirConError(res, mensaje);
  }
};

// Consulta las colecciones y renderiza el panel.
exports.mostrarPanel = async (req, res) => {
  const [clientes, productos, repartidores, pedidos] = await Promise.all([
    Cliente.find().sort({ nombre: 1 }),
    Producto.find().sort({ nombre: 1 }),
    Repartidor.find().sort({ nombre: 1 }),
    Pedido.find()
      .populate("idCliente", "nombre")
      .populate("idProductos", "nombre")
      .populate("idRepartidor", "nombre")
      .sort({ createdAt: -1 }),
  ]);

  res.render("index", {
    titulo: "FreshRoute",
    clientes,
    productos,
    pedidos,
    repartidores,
    error: req.query.error || null,
  });
};

exports.agregarCliente = accion(async (req) => {
  const { nombre, telefono, direccion } = req.body;
  await Cliente.create({ nombre, telefono, direccion });
});

exports.agregarProducto = accion(async (req) => {
  const { nombre, precio, stock, categoria } = req.body;
  await Producto.create({
    nombre,
    precio: precio === "" ? undefined : Number(precio),
    stock: stock === "" ? undefined : Number(stock),
    categoria: categoria?.trim() || undefined,
  });
});

exports.agregarRepartidor = accion(async (req) => {
  const { nombre, telefono, vehiculo } = req.body;
  await Repartidor.create({ nombre, telefono, vehiculo });
});

exports.agregarPedido = accion(async (req) => {
  const { idCliente, idProductos, idRepartidor, direccionEntrega } = req.body;
  await Pedido.crearConRelaciones({
    idCliente,
    idProductos: [idProductos],
    idRepartidor,
    direccionEntrega,
  });
});

// Las eliminaciones aplican las mismas reglas que la API.
exports.eliminarCliente = accion(async (req) => {
  const cliente = await Cliente.findById(req.params.id);
  if (!cliente) throw new ErrorNoEncontrado("No se encontró el cliente seleccionado");
  if (await Pedido.existenActivos({ idCliente: cliente._id })) {
    throw new ErrorDeConflicto(
      "No se puede eliminar un cliente con pedidos activos",
    );
  }
  await cliente.deleteOne();
});

exports.eliminarProducto = accion(async (req) => {
  const producto = await Producto.findById(req.params.id);
  if (!producto) throw new ErrorNoEncontrado("No se encontró el producto seleccionado");
  if (await Pedido.existenActivos({ idProductos: producto._id })) {
    throw new ErrorDeConflicto(
      "No se puede eliminar un producto con pedidos activos",
    );
  }
  await producto.deleteOne();
});

exports.eliminarPedido = accion(async (req) => {
  const pedido = await Pedido.findByIdAndDelete(req.params.id);
  if (!pedido) throw new ErrorNoEncontrado("No se encontró el pedido seleccionado");
});

exports.eliminarRepartidor = accion(async (req) => {
  const repartidor = await Repartidor.findByIdAndDelete(req.params.id);
  if (!repartidor) throw new ErrorNoEncontrado("No se encontró el repartidor seleccionado");
});
