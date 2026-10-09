const Producto = require("../models/Producto");
const Pedido = require("../models/Pedido");

// Obtener todos los productos con filtros opcionales (nombre y categoria)
exports.obtenerProductos = async (req, res) => {
  try {
    const { nombre, categoria } = req.query;
    const filtro = {};

    // Busqueda parcial por nombre sin importar mayusculas o minusculas
    if (nombre) {
      filtro.nombre = { $regex: nombre, $options: "i" };
    }

    // Filtro exacto por categoria
    if (categoria) {
      filtro.categoria = { $regex: `^${categoria}$`, $options: "i" };
    }

    const productos = await Producto.find(filtro);
    res.status(200).json(productos);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al obtener la lista de productos",
        detalle: error.message,
      });
  }
};

// Obtener un producto especifico por su ID de MongoDB
exports.obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(producto);
  } catch (error) {
    res
      .status(400)
      .json({ error: "ID de producto no valido", detalle: error.message });
  }
};

// Crear un nuevo producto en la base de datos
exports.crearProducto = async (req, res) => {
  try {
    const { nombre, precio, stock, categoria } = req.body;

    // Validacion de campos obligatorios
    if (!nombre || precio === undefined || stock === undefined) {
      return res
        .status(400)
        .json({ error: "El producto debe tener nombre, precio y stock" });
    }

    // Validaciones de tipos de datos y valores permitidos
    if (typeof precio !== "number" || precio <= 0) {
      return res
        .status(400)
        .json({ error: "El precio debe ser un numero mayor a cero" });
    }

    if (typeof stock !== "number" || stock < 0) {
      return res.status(400).json({ error: "El stock no puede ser negativo" });
    }

    // Verificacion de duplicados por nombre
    const productoExistente = await Producto.findOne({
      nombre: { $regex: `^${nombre}$`, $options: "i" },
    });

    if (productoExistente) {
      return res
        .status(409)
        .json({ error: "Ya existe un producto registrado con ese nombre" });
    }

    const nuevoProducto = new Producto({ nombre, precio, stock, categoria });
    await nuevoProducto.save();

    res
      .status(201)
      .json({ mensaje: "Producto creado con exito", producto: nuevoProducto });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al crear el producto", detalle: error.message });
  }
};

// Actualizar datos generales de un producto por ID
exports.actualizarProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const { precio, stock } = req.body;

    if (precio !== undefined && (typeof precio !== "number" || precio <= 0)) {
      return res
        .status(400)
        .json({ error: "El precio debe ser un numero mayor a cero" });
    }

    if (stock !== undefined && (typeof stock !== "number" || stock < 0)) {
      return res
        .status(400)
        .json({ error: "El stock debe ser un numero mayor o igual a cero" });
    }

    // Se invoca el metodo de instancia del modelo Producto
    producto.actualizarDatos(req.body);
    await producto.save();

    res
      .status(200)
      .json({ mensaje: "Producto actualizado exitosamente", producto });
  } catch (error) {
    res
      .status(400)
      .json({
        error: "Error al actualizar el producto",
        detalle: error.message,
      });
  }
};

// Ajustar el stock de un producto por ID
exports.ajustarStock = async (req, res) => {
  try {
    const { cantidad } = req.body;

    if (cantidad === undefined || typeof cantidad !== "number") {
      return res
        .status(400)
        .json({ error: "Debe indicar la cantidad a ajustar como un numero" });
    }

    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Se invoca el metodo del esquema que valida que el stock no quede negativo
    producto.ajustarStock(cantidad);
    await producto.save();

    res
      .status(200)
      .json({ mensaje: "Stock actualizado exitosamente", producto });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un producto de la base de datos
exports.eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Regla de negocio: no eliminar productos con pedidos activos en el sistema
    const estadosActivos = ["Pendiente", "Preparado", "En camino"];
    const tienePedidosActivos = await Pedido.findOne({
      idProductos: req.params.id,
      estado: { $in: estadosActivos },
    });

    if (tienePedidosActivos) {
      return res
        .status(409)
        .json({
          error: "No se puede eliminar un producto con pedidos activos",
        });
    }

    await Producto.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ mensaje: "Producto eliminado exitosamente", producto });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al eliminar el producto", detalle: error.message });
  }
};
