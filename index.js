const express = require("express");
const app = express();
const port = 3000;

// Importar rutas
const pedidosRoutes = require("./routes/pedidos");
const clientesRoutes = require("./routes/clientes");
const productosRoutes = require("./routes/productos");

// Middlewares
app.use(express.json()); // Permite procesar el req.body en JSON
app.use(express.urlencoded({ extended: false }));

// Configuración de Motor de Plantillas (Pug)
app.set("views", "./views");
app.set("view engine", "pug");

// Ruta principal renderizando Pug
app.get("/", (req, res) => {
  res.render("index", {
    titulo: "FreshRoute API",
    mensaje: "Bienvenido al sistema de distribución",
  });
});

// Conectar Rutas (Rutas dinámicas)
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/productos", productosRoutes);

// Manejador de errores inesperados (fallas de lectura/escritura de la base,
// bugs no previstos, etc.) — siempre debe ir después de las rutas
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// Iniciar servidor (solo si el archivo se ejecuta directamente, no al importarlo en tests)
if (require.main === module) {
  app.listen(port, () => {
    console.log(
      `Servidor de FreshRoute escuchando en http://localhost:${port}`,
    );
  });
}

module.exports = app;
