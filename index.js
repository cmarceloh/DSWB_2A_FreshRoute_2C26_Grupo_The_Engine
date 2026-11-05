// Punto de entrada: carga la configuración, conecta a MongoDB Atlas y levanta el servidor.
require("dotenv").config({ quiet: true });

const app = require("./app");
const conectarDB = require("./config/db");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";

// Inicio asíncrono del servidor cuando se ejecuta directamente (node index.js / npm run dev)
const iniciarServidor = async () => {
  await conectarDB();
  app.listen(PORT, HOST, () => {
    console.log(`Servidor de FreshRoute escuchando en http://${HOST}:${PORT}`);
  });
};

if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
