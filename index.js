// Punto de entrada: carga la configuración, conecta a MongoDB Atlas y levanta el servidor HTTP + WebSockets (Socket.io).
require("dotenv").config({ quiet: true });

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const conectarDB = require("./config/db");
const { configurarSockets } = require("./socket/chat");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";

// Creación del servidor HTTP y enlace con Socket.io (D12. Websockets, págs. 13 y 17)
const server = http.createServer(app);
const io = new Server(server);
configurarSockets(io);

// Inicio asíncrono del servidor cuando se ejecuta directamente (node index.js / npm run dev)
const iniciarServidor = async () => {
  await conectarDB();
  server.listen(PORT, HOST, () => {
    console.log(`Servidor de FreshRoute (HTTP + WebSockets) escuchando en http://${HOST}:${PORT}`);
  });
};

if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
