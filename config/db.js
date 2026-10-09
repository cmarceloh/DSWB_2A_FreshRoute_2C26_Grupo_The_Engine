const mongoose = require("mongoose");

const conectarDB = async () => {
  try {
    // Busca la variable del .env o usa la conexión local por defecto si viene undefined
    const mongoURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/freshroute";

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = conectarDB;
