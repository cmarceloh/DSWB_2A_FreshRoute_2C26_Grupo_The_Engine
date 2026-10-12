// Seeder: vacía las colecciones y carga datos de ejemplo para probar la app.
// Uso: npm run seed
// ATENCIÓN: borra todos los clientes, productos, repartidores y pedidos de la base indicada en MONGO_URI.
require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");
const Cliente = require("./models/Cliente");
const Producto = require("./models/Producto");
const Repartidor = require("./models/Repartidor");
const Pedido = require("./models/Pedido");

const clientes = [
  { nombre: "Juan Perez", telefono: "1122334455", direccion: "Calle Falsa 123" },
  { nombre: "María Gómez", telefono: "1133445566", direccion: "Av. Corrientes 1450" },
  { nombre: "Lucas Fernández", telefono: "1144556677", direccion: "San Martín 800" },
  { nombre: "Sofía Romero", telefono: "1155667788", direccion: "Belgrano 2310" },
  { nombre: "Carlos Díaz", telefono: "1166778899", direccion: "Mitre 56" },
];

const productos = [
  { nombre: "Manzana", precio: 500, stock: 100, categoria: "Frutas" },
  { nombre: "Banana", precio: 450, stock: 80, categoria: "Frutas" },
  { nombre: "Naranja", precio: 400, stock: 120, categoria: "Frutas" },
  { nombre: "Lechuga", precio: 300, stock: 40, categoria: "Verduras" },
  { nombre: "Tomate", precio: 650, stock: 60, categoria: "Verduras" },
  { nombre: "Papa", precio: 350, stock: 200, categoria: "Verduras" },
  { nombre: "Leche entera 1L", precio: 1200, stock: 50, categoria: "Lácteos" },
  { nombre: "Queso cremoso", precio: 5200, stock: 25, categoria: "Lácteos" },
];

const repartidores = [
  { nombre: "Martín López", telefono: "1177889900", vehiculo: "Moto" },
  { nombre: "Ana Torres", telefono: "1188990011", vehiculo: "Bicicleta" },
  { nombre: "Diego Suárez", telefono: "1199001122", vehiculo: "Camioneta", disponible: false },
];

// Pedidos de ejemplo: cada uno referencia clientes, productos y repartidores por su
// posición en los arrays de arriba, y recorre los estados que se quieran mostrar.
const pedidos = [
  { cliente: 0, productos: [0, 1], repartidor: 0, estados: [] },
  { cliente: 1, productos: [3, 4, 4], repartidor: 1, estados: ["Preparado"] },
  { cliente: 2, productos: [6, 7], repartidor: 0, estados: ["Preparado", "En camino"] },
  { cliente: 3, productos: [5, 5, 2], repartidor: 1, estados: ["Preparado", "En camino", "Entregado"] },
  { cliente: 4, productos: [0], repartidor: null, estados: ["Cancelado"] },
  { cliente: 0, productos: [7], repartidor: null, estados: [] },
];

const sembrar = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/freshroute";
  await mongoose.connect(uri);
  console.log(`Conectado a ${mongoose.connection.name}`);

  // Los índices únicos deben existir antes de insertar
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));

  await Promise.all([
    Pedido.deleteMany({}),
    Cliente.deleteMany({}),
    Producto.deleteMany({}),
    Repartidor.deleteMany({}),
  ]);

  const clientesCreados = await Cliente.create(clientes);
  const productosCreados = await Producto.create(productos);
  const repartidoresCreados = await Repartidor.create(repartidores);

  // Los pedidos se crean con la misma lógica que la API (calcula monto y valida relaciones)
  for (const datos of pedidos) {
    const pedido = await Pedido.crearConRelaciones({
      idCliente: clientesCreados[datos.cliente]._id,
      idProductos: datos.productos.map((i) => productosCreados[i]._id),
      idRepartidor:
        datos.repartidor === null ? null : repartidoresCreados[datos.repartidor]._id,
    });

    for (const estado of datos.estados) pedido.actualizarEstado(estado);
    if (datos.estados.length) await pedido.save();
  }

  console.log(
    `Datos cargados: ${clientesCreados.length} clientes, ${productosCreados.length} productos, ` +
      `${repartidoresCreados.length} repartidores y ${pedidos.length} pedidos.`,
  );
};

sembrar()
  .catch((error) => {
    console.error("Error al cargar los datos:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
