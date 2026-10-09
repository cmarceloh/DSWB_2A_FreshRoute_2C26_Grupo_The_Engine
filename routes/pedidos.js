const express = require("express");
const router = express.Router();
const pedidosController = require("../controllers/pedidosController");

// Ruta para obtener todos los pedidos (soporta filtros ?estado= y ?idCliente=)
router.get("/", pedidosController.obtenerPedidos);

// Ruta para obtener un pedido especifico por su ID de MongoDB
router.get("/:id", pedidosController.obtenerPedidoPorId);

// Ruta para registrar un nuevo pedido en el sistema
router.post("/", pedidosController.crearPedido);

// Ruta para actualizar/cambiar el estado de un pedido
router.patch("/:id/estado", pedidosController.cambiarEstado);
router.put("/:id/estado", pedidosController.cambiarEstado);

module.exports = router;
