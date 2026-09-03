const express = require("express");
const app = express();
const port = 3000;

// Importar rutas
const pedidosRoutes = require("./routes/pedidos");

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

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor de FreshRoute escuchando en http://localhost:${port}`);
});
