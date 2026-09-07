const fs = require("fs");
const path = require("path");
const Cliente = require("../models/Cliente");

// Ruta absoluta al archivo JSON
const dbPath = path.join(__dirname, "../data/database.json");

// Función auxiliar para leer la base de datos
const leerDB = () => {
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data);
};

// Función auxiliar para escribir en la base de datos
const escribirDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
};

// Controlador para obtener todos los clientes (con filtro opcional por query param)
const obtenerClientes = (req, res) => {
  const db = leerDB();
  const { nombre } = req.query;

  // Consulta: filtrar clientes por nombre (búsqueda parcial, sin importar mayúsculas)
  if (nombre) {
    const resultado = db.clientes.filter((c) =>
      c.nombre.toLowerCase().includes(nombre.toLowerCase()),
    );
    return res.json(resultado);
  }

  res.json(db.clientes);
};

// Controlador para obtener un cliente por ID
const obtenerClientePorId = (req, res) => {
  const id = parseInt(req.params.id);
  const db = leerDB();

  const cliente = db.clientes.find((c) => c.id === id);
  if (!cliente) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  res.json(cliente);
};

// Controlador para crear un cliente
const crearCliente = (req, res) => {
  const { nombre, telefono, direccion } = req.body;

  // Validación: campos obligatorios
  if (!nombre || !telefono) {
    return res
      .status(400)
      .json({ error: "El cliente debe tener nombre y teléfono" });
  }

  // Validación: tipos de datos
  if (typeof nombre !== "string" || typeof telefono !== "string") {
    return res
      .status(400)
      .json({ error: "Nombre y teléfono deben ser texto" });
  }

  const db = leerDB();

  // no permitir dos clientes con el mismo teléfono
  const telefonoDuplicado = db.clientes.some((c) => c.telefono === telefono);
  if (telefonoDuplicado) {
    return res
      .status(409)
      .json({ error: "Ya existe un cliente registrado con ese teléfono" });
  }

  const nuevoCliente = new Cliente(nombre, telefono, direccion);
  db.clientes.push(nuevoCliente);
  escribirDB(db);

  res
    .status(201)
    .json({ mensaje: "Cliente creado con éxito", cliente: nuevoCliente });
};

// Controlador para actualizar datos de un cliente
const actualizarCliente = (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, telefono, direccion } = req.body;
  const db = leerDB();

  const clienteIndex = db.clientes.findIndex((c) => c.id === id);
  if (clienteIndex === -1) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  // Validación
  if (nombre && typeof nombre !== "string") {
    return res.status(400).json({ error: "El nombre debe ser texto" });
  }
  if (telefono && typeof telefono !== "string") {
    return res.status(400).json({ error: "El teléfono debe ser texto" });
  }

  // Instanciar la clase Cliente con los datos guardados
  const datosGuardados = db.clientes[clienteIndex];
  const clienteActivo = new Cliente(
    datosGuardados.nombre,
    datosGuardados.telefono,
    datosGuardados.direccion,
  );
  clienteActivo.id = datosGuardados.id;

  // Ejecutar el método de la clase para actualizar los datos
  clienteActivo.actualizarDatos(req.body);

  db.clientes[clienteIndex] = clienteActivo;
  escribirDB(db);

  res.json({
    mensaje: "Cliente actualizado exitosamente",
    cliente: clienteActivo,
  });
};

// Controlador para eliminar un cliente
const eliminarCliente = (req, res) => {
  const id = parseInt(req.params.id);
  const db = leerDB();

  const clienteIndex = db.clientes.findIndex((c) => c.id === id);
  if (clienteIndex === -1) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  // no se puede eliminar un cliente que tiene pedidos activos
  const estadosActivos = ["Pendiente", "Preparado", "En camino"];
  const tienePedidosActivos = db.pedidos.some(
    (p) => p.idCliente === id && estadosActivos.includes(p.estado),
  );

  if (tienePedidosActivos) {
    return res.status(409).json({
      error: "No se puede eliminar un cliente con pedidos activos",
    });
  }

  const clienteEliminado = db.clientes.splice(clienteIndex, 1);
  escribirDB(db);

  res.json({
    mensaje: "Cliente eliminado exitosamente",
    cliente: clienteEliminado[0],
  });
};

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};