// Carga las variables de configuración definidas en el archivo .env.
require("dotenv").config({ quiet: true });

// Importa Express, utilidades de rutas, conexión a MongoDB y modelos del panel.
const express = require("express");
const path = require("path");
const conectarDB = require("./config/db");
const Cliente = require("./models/Cliente");
const Producto = require("./models/Producto");
const Pedido = require("./models/Pedido");
const Repartidor = require("./models/Repartidor");

// Define la aplicación HTTP y la interfaz/puerto de escucha del servidor.
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";

// 1. Middlewares para procesar datos de peticiones HTTP
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Archivos estáticos (CSS, imágenes)
app.use(express.static(path.join(__dirname, "public")));

// 3. Configuración del Motor de Plantillas (Pug)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// 4. Controlador de la página principal: consulta las colecciones para el panel.
app.get("/", async (req, res) => {
  try {
    const [clientes, productos, pedidos, repartidores] = await Promise.all([
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
  } catch (error) {
    console.error("Error al cargar el panel:", error.message);
    res.status(500).send("No se pudo cargar el panel. Intenta nuevamente.");
  }
});

// 5. Controlador del formulario: valida y guarda un cliente en MongoDB.
app.post("/agregar-cliente", async (req, res) => {
  const { nombre, telefono, direccion } = req.body;

  if (!nombre?.trim() || !telefono?.trim() || !direccion?.trim()) {
    return res.redirect(
      `/?error=${encodeURIComponent("Completa todos los campos del cliente.")}`,
    );
  }

  try {
    await Cliente.create({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
    });
    res.redirect("/");
  } catch (error) {
    console.error("Error al guardar el cliente:", error.message);
    res.redirect(
      `/?error=${encodeURIComponent("No se pudo guardar el cliente.")}`,
    );
  }
});

// 6. Controlador del formulario: valida y guarda un producto en MongoDB.
app.post("/agregar-producto", async (req, res) => {
  const { nombre, precio, stock, categoria } = req.body;
  const precioNumerico = Number(precio);
  const stockNumerico = Number(stock);

  if (
    !nombre?.trim() ||
    precio === "" ||
    stock === "" ||
    !Number.isFinite(precioNumerico) ||
    precioNumerico <= 0 ||
    !Number.isFinite(stockNumerico) ||
    stockNumerico < 0
  ) {
    return res.redirect(
      `/?error=${encodeURIComponent("Ingresa un nombre, un precio mayor que cero y un stock válido.")}`,
    );
  }

  try {
    await Producto.create({
      nombre: nombre.trim(),
      precio: precioNumerico,
      stock: stockNumerico,
      categoria: categoria?.trim() || undefined,
    });
    res.redirect("/");
  } catch (error) {
    console.error("Error al guardar el producto:", error.message);
    res.redirect(
      `/?error=${encodeURIComponent("No se pudo guardar el producto.")}`,
    );
  }
});

// Controlador del formulario: valida y guarda un repartidor en MongoDB.
app.post("/agregar-repartidor", async (req, res) => {
  const { nombre, telefono, vehiculo } = req.body;

  if (!nombre?.trim() || !telefono?.trim() || !vehiculo?.trim()) {
    return res.redirect(
      `/?error=${encodeURIComponent("Completa todos los campos del repartidor.")}`,
    );
  }

  try {
    await Repartidor.create({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      vehiculo: vehiculo.trim(),
    });
    res.redirect("/");
  } catch (error) {
    console.error("Error al guardar el repartidor:", error.message);
    res.redirect(
      `/?error=${encodeURIComponent("No se pudo guardar el repartidor.")}`,
    );
  }
});

// Controlador del formulario: valida los datos del pedido y confirma sus relaciones.
app.post("/agregar-pedido", async (req, res) => {
  const {
    idCliente,
    idProductos,
    idRepartidor,
    montoTotal,
    direccionEntrega,
  } = req.body;
  const montoNumerico = Number(montoTotal);

  if (
    !idCliente ||
    !idProductos ||
    !direccionEntrega?.trim() ||
    montoTotal === "" ||
    !Number.isFinite(montoNumerico) ||
    montoNumerico <= 0
  ) {
    return res.redirect(
      `/?error=${encodeURIComponent("Completa todos los campos del pedido con valores válidos.")}`,
    );
  }

  try {
    const [cliente, producto, repartidor] = await Promise.all([
      Cliente.findById(idCliente),
      Producto.findById(idProductos),
      idRepartidor ? Repartidor.findById(idRepartidor) : null,
    ]);

    if (!cliente || !producto || (idRepartidor && !repartidor)) {
      return res.redirect(
        `/?error=${encodeURIComponent("Selecciona un cliente y un producto registrados, y un repartidor válido si corresponde.")}`,
      );
    }

    await Pedido.create({
      idCliente,
      idProductos: [idProductos],
      idRepartidor: idRepartidor || null,
      montoTotal: montoNumerico,
      direccionEntrega: direccionEntrega.trim(),
    });
    res.redirect("/");
  } catch (error) {
    console.error("Error al guardar el pedido:", error.message);
    res.redirect(
      `/?error=${encodeURIComponent("No se pudo guardar el pedido.")}`,
    );
  }
});

// Controlador del formulario: elimina un cliente y vuelve al panel.
app.post("/eliminar-cliente/:id", async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) {
      return res.redirect(
        `/?error=${encodeURIComponent("No se encontró el cliente seleccionado.")}`,
      );
    }
    res.redirect("/");
  } catch (error) {
    console.error("Error al eliminar el cliente:", error.message);
    res.redirect(
      `/?error=${encodeURIComponent("No se pudo eliminar el cliente.")}`,
    );
  }
});

// Controlador del formulario: elimina un producto y vuelve al panel.
app.post("/eliminar-producto/:id", async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) {
      return res.redirect(
        `/?error=${encodeURIComponent("No se encontró el producto seleccionado.")}`,
      );
    }
    res.redirect("/");
  } catch (error) {
    console.error("Error al eliminar el producto:", error.message);
    res.redirect(
      `/?error=${encodeURIComponent("No se pudo eliminar el producto.")}`,
    );
  }
});

// Controlador del formulario: elimina un pedido y vuelve al panel.
app.post("/eliminar-pedido/:id", async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndDelete(req.params.id);
    if (!pedido) {
      return res.redirect(
        `/?error=${encodeURIComponent("No se encontró el pedido seleccionado.")}`,
      );
    }
    res.redirect("/");
  } catch (error) {
    console.error("Error al eliminar el pedido:", error.message);
    res.redirect(
      `/?error=${encodeURIComponent("No se pudo eliminar el pedido.")}`,
    );
  }
});

// 7. Importación y montaje de los enrutadores de la API.
const pedidosRoutes = require("./routes/pedidos");
const clientesRoutes = require("./routes/clientes");
const productosRoutes = require("./routes/productos");
const repartidoresRoutes = require("./routes/repartidores");

app.use("/api/pedidos", pedidosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/repartidores", repartidoresRoutes);

// 8. Respuesta JSON para las rutas que no existen.
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint no encontrado" });
});

// 9. Inicio asíncrono del servidor después de establecer la conexión a MongoDB.
const iniciarServidor = async () => {
  try {
    await conectarDB();
    app.listen(PORT, HOST, () => {
      console.log(
        `Servidor de FreshRoute escuchando en el puerto ${PORT} (HOST=${HOST})`,
      );
    });
  } catch (error) {
    console.error("Error al iniciar la aplicación:", error.message);
    process.exitCode = 1;
  }
};

if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
