const mongoose = require("mongoose");

const conectarDB = async () => {
  try {
    // Si ya existe una conexión activa (por ejemplo en tests o serverless warm start), la reutiliza
    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }

    // Busca la variable del .env (MongoDB Atlas) o usa la conexión local por defecto si viene undefined
    const mongoURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/freshroute";

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = conectarDB;
