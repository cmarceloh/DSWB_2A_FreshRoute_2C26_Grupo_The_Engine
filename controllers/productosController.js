const Producto = require("../models/Producto");
const Pedido = require("../models/Pedido");
const ErrorDeValidacion = require("../models/ErrorDeValidacion");
const ErrorNoEncontrado = require("../models/ErrorNoEncontrado");
const ErrorDeConflicto = require("../models/ErrorDeConflicto");

// Los errores lanzados acá los atrapa el middleware de errores (Express 5 captura promesas rechazadas).

// Busca un producto por ID o lanza ErrorNoEncontrado
const buscarProducto = async (id) => {
  const producto = await Producto.findById(id);
  if (!producto) throw new ErrorNoEncontrado("Producto no encontrado");
  return producto;
};

// Escapa los caracteres especiales de regex para usar texto del usuario en un filtro
const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Obtener todos los productos con filtros opcionales (nombre y categoria)
exports.obtenerProductos = async (req, res) => {
  const { nombre, categoria } = req.query;
  const filtro = {};

  // Busqueda parcial por nombre sin importar mayusculas o minusculas
  if (nombre) {
    filtro.nombre = { $regex: escaparRegex(nombre), $options: "i" };
  }

  // Filtro exacto por categoria
  if (categoria) {
    filtro.categoria = {
      $regex: `^${escaparRegex(categoria)}$`,
      $options: "i",
    };
  }

  res.status(200).json(await Producto.find(filtro));
};

// Obtener un producto especifico por su ID de MongoDB
exports.obtenerProductoPorId = async (req, res) => {
  res.status(200).json(await buscarProducto(req.params.id));
};

// Crear un nuevo producto en la base de datos
exports.crearProducto = async (req, res) => {
  const { nombre, precio, stock, categoria } = req.body;

  // Validaciones de tipos de datos (los obligatorios y los rangos los valida el schema)
  if (nombre !== undefined && typeof nombre !== "string") {
    throw new ErrorDeValidacion("El nombre debe ser texto");
  }
  if (
    (precio !== undefined && typeof precio !== "number") ||
    (stock !== undefined && typeof stock !== "number")
  ) {
    throw new ErrorDeValidacion("El precio y el stock deben ser numericos");
  }

  // El nombre duplicado lo rechaza el indice unico (409 en el middleware)
  const nuevoProducto = await Producto.create({
    nombre,
    precio,
    stock,
    categoria,
  });

  res
    .status(201)
    .json({ mensaje: "Producto creado con exito", producto: nuevoProducto });
};

// Actualizar datos generales de un producto por ID
exports.actualizarProducto = async (req, res) => {
  const producto = await buscarProducto(req.params.id);
  const { nombre, precio, stock } = req.body;

  if (nombre !== undefined && typeof nombre !== "string") {
    throw new ErrorDeValidacion("El nombre debe ser texto");
  }
  if (precio !== undefined && typeof precio !== "number") {
    throw new ErrorDeValidacion("El precio debe ser un numero");
  }
  if (stock !== undefined && typeof stock !== "number") {
    throw new ErrorDeValidacion("El stock debe ser un numero");
  }

  // Se invoca el metodo de instancia del modelo; los rangos los valida el schema al guardar
  producto.actualizarDatos(req.body);
  await producto.save();

  res
    .status(200)
    .json({ mensaje: "Producto actualizado exitosamente", producto });
};

// Ajustar el stock de un producto por ID
exports.ajustarStock = async (req, res) => {
  const { cantidad } = req.body;

  if (typeof cantidad !== "number") {
    throw new ErrorDeValidacion(
      "Debe indicar la cantidad a ajustar como un numero",
    );
  }

  const producto = await buscarProducto(req.params.id);

  // Se invoca el metodo del esquema que valida que el stock no quede negativo
  producto.ajustarStock(cantidad);
  await producto.save();

  res.status(200).json({ mensaje: "Stock actualizado exitosamente", producto });
};

// Eliminar un producto de la base de datos
exports.eliminarProducto = async (req, res) => {
  const producto = await buscarProducto(req.params.id);

  // Regla de negocio: no eliminar productos con pedidos activos en el sistema
  if (await Pedido.existenActivos({ idProductos: producto._id })) {
    throw new ErrorDeConflicto(
      "No se puede eliminar un producto con pedidos activos",
    );
  }

  await producto.deleteOne();

  res
    .status(200)
    .json({ mensaje: "Producto eliminado exitosamente", producto });
};
