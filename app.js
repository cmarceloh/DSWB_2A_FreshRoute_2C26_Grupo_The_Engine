// Define la aplicación Express (sin conectar a la base ni abrir el puerto),
// para poder importarla desde index.js y desde los tests.
const express = require("express");
const path = require("path");
const { errorHandler } = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");

const app = express();

// 1. Middlewares para procesar datos de peticiones HTTP
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Archivos estáticos (CSS, imágenes)
app.use(express.static(path.join(__dirname, "public")));

// 3. Configuración del Motor de Plantillas (Pug)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// 4. Rutas del panel web (vistas Pug y formularios)
app.use("/", require("./routes/vistas"));

// 5. Rutas de la API
app.use("/api/pedidos", require("./routes/pedidos"));
app.use("/api/clientes", require("./routes/clientes"));
app.use("/api/productos", require("./routes/productos"));
app.use("/api/repartidores", require("./routes/repartidores"));

// 6. Rutas inexistentes y manejo de errores (siempre al final)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
