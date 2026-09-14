const fs = require("fs");
const path = require("path");
const Producto = require("../models/Producto");
const ErrorDeValidacion = require("../models/ErrorDeValidacion");

// Ruta absoluta al archivo JSON
const dbPath = path.join(__dirname, "../data/database.json");

// Función auxiliar para leer la base de datos
const leerDB = () => {
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data);
};

// Función auxiliar para escribir en la base de datos
const escribirDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
};

// Controlador para obtener todos los productos (con filtros opcionales por query params)
const obtenerProductos = (req, res) => {
  const db = leerDB();
  const { nombre, categoria } = req.query;
  let resultado = db.productos;

  // Consulta: filtrar productos por nombre (búsqueda parcial, sin importar mayúsculas)
  if (nombre) {
    resultado = resultado.filter((p) =>
      p.nombre.toLowerCase().includes(nombre.toLowerCase()),
    );
  }

  // Consulta: filtrar productos por categoría
  if (categoria) {
    resultado = resultado.filter(
      (p) => p.categoria.toLowerCase() === categoria.toLowerCase(),
    );
  }

  res.json(resultado);
};

// Controlador para obtener un producto por ID
const obtenerProductoPorId = (req, res) => {
  const id = parseInt(req.params.id);
  const db = leerDB();

  const producto = db.productos.find((p) => p.id === id);
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(producto);
};

// Controlador para crear un producto
const crearProducto = (req, res) => {
  const { nombre, precio, stock, categoria } = req.body;

  // Validación: campos obligatorios
  if (!nombre || precio === undefined || stock === undefined) {
    return res
      .status(400)
      .json({ error: "El producto debe tener nombre, precio y stock" });
  }

  // Validación: tipos de datos
  if (typeof nombre !== "string") {
    return res.status(400).json({ error: "El nombre debe ser texto" });
  }
  if (typeof precio !== "number" || typeof stock !== "number") {
    return res
      .status(400)
      .json({ error: "El precio y el stock deben ser numéricos" });
  }

  // Validación: valores válidos
  if (precio <= 0) {
    return res.status(400).json({ error: "El precio debe ser mayor a cero" });
  }
  if (stock < 0) {
    return res.status(400).json({ error: "El stock no puede ser negativo" });
  }

  const db = leerDB();

  // no permitir dos productos con el mismo nombre
  const nombreDuplicado = db.productos.some(
    (p) => p.nombre.toLowerCase() === nombre.toLowerCase(),
  );
  if (nombreDuplicado) {
    return res
      .status(409)
      .json({ error: "Ya existe un producto registrado con ese nombre" });
  }

  const nuevoProducto = new Producto(nombre, precio, stock, categoria);
  db.productos.push(nuevoProducto);
  escribirDB(db);

  res
    .status(201)
    .json({ mensaje: "Producto creado con éxito", producto: nuevoProducto });
};

// Controlador para actualizar datos de un producto
const actualizarProducto = (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, precio, stock } = req.body;
  const db = leerDB();

  const productoIndex = db.productos.findIndex((p) => p.id === id);
  if (productoIndex === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  // Validación
  if (nombre && typeof nombre !== "string") {
    return res.status(400).json({ error: "El nombre debe ser texto" });
  }
  if (precio !== undefined && (typeof precio !== "number" || precio <= 0)) {
    return res
      .status(400)
      .json({ error: "El precio debe ser un número mayor a cero" });
  }
  if (stock !== undefined && (typeof stock !== "number" || stock < 0)) {
    return res
      .status(400)
      .json({ error: "El stock debe ser un número mayor o igual a cero" });
  }

  // Instanciar la clase Producto con los datos guardados
  const datosGuardados = db.productos[productoIndex];
  const productoActivo = new Producto(
    datosGuardados.nombre,
    datosGuardados.precio,
    datosGuardados.stock,
    datosGuardados.categoria,
  );
  productoActivo.id = datosGuardados.id;

  // Ejecutar el método de la clase para actualizar los datos
  productoActivo.actualizarDatos(req.body);

  db.productos[productoIndex] = productoActivo;
  escribirDB(db);

  res.json({
    mensaje: "Producto actualizado exitosamente",
    producto: productoActivo,
  });
};

// Controlador para ajustar el stock de un producto
const ajustarStock = (req, res) => {
  const id = parseInt(req.params.id); // Captura el ID de la ruta
  const { cantidad } = req.body; // Captura la cantidad enviada en formato JSON
  const db = leerDB();

  // Validación: campo obligatorio
  if (cantidad === undefined || typeof cantidad !== "number") {
    return res
      .status(400)
      .json({ error: "Debe indicar la cantidad a ajustar" });
  }

  // Buscar la posición del producto en el array
  const productoIndex = db.productos.findIndex((p) => p.id === id);
  if (productoIndex === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  // Instanciar la clase Producto con los datos guardados
  const datosGuardados = db.productos[productoIndex];
  const productoActivo = new Producto(
    datosGuardados.nombre,
    datosGuardados.precio,
    datosGuardados.stock,
    datosGuardados.categoria,
  );
  productoActivo.id = datosGuardados.id;

  // Ejecutar el método de la clase para validar el ajuste de stock
  try {
    productoActivo.ajustarStock(cantidad);

    // Si la validación es correcta, actualizar el array y sobrescribir el JSON
    db.productos[productoIndex] = productoActivo;
    escribirDB(db);

    res.json({
      mensaje: "Stock actualizado exitosamente",
      producto: productoActivo,
    });
  } catch (error) {
    // Si la cantidad deja el stock en negativo
    if (error instanceof ErrorDeValidacion) {
      return res.status(400).json({ error: error.message });
    }
    // Cualquier otro error es inesperado (lo toma el manejador global)
    throw error;
  }
};

// Controlador para eliminar un producto
const eliminarProducto = (req, res) => {
  const id = parseInt(req.params.id);
  const db = leerDB();

  const productoIndex = db.productos.findIndex((p) => p.id === id);
  if (productoIndex === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  // no se puede eliminar un producto que forma parte de pedidos activos
  const estadosActivos = ["Pendiente", "Preparado", "En camino"];
  const tienePedidosActivos = db.pedidos.some(
    (p) =>
      estadosActivos.includes(p.estado) && p.idProductos.includes(id),
  );

  if (tienePedidosActivos) {
    return res.status(409).json({
      error: "No se puede eliminar un producto con pedidos activos",
    });
  }

  const productoEliminado = db.productos.splice(productoIndex, 1);
  escribirDB(db);

  res.json({
    mensaje: "Producto eliminado exitosamente",
    producto: productoEliminado[0],
  });
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  ajustarStock,
  eliminarProducto,
};
