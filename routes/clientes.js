const express = require("express");
const router = express.Router();
const clientesController = require("../controllers/clientesController");

// Ruta para obtener todos los clientes o filtrar por query param (?nombre=)
router.get("/", clientesController.obtenerClientes);

// Ruta para obtener un cliente especifico por su ID de MongoDB
router.get("/:id", clientesController.obtenerClientePorId);

// Ruta para registrar un nuevo cliente
router.post("/", clientesController.crearCliente);

// Ruta para actualizar los datos de un cliente existente por ID
router.put("/:id", clientesController.actualizarCliente);

// Ruta para eliminar un cliente por ID
router.delete("/:id", clientesController.eliminarCliente);

module.exports = router;
