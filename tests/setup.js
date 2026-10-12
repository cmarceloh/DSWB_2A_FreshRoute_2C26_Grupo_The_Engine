// Prepara una base MongoDB en memoria para los tests, así no hace falta tener
// MongoDB instalado ni se toca la base real.
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Se cargan los modelos para poder crear sus índices únicos antes de los tests
require("../models/Cliente");
require("../models/Producto");
require("../models/Pedido");
require("../models/Repartidor");

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
});

// Cada test parte de colecciones vacías
afterEach(async () => {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})),
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
