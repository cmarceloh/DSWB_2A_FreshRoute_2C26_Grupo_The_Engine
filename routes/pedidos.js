const express = require("express");
const router = express.Router();
const pedidosController = require("../controllers/pedidosController");

// Definir las rutas
router.get("/", pedidosController.obtenerPedidos);
router.get("/:id", pedidosController.obtenerPedidoPorId);
router.post("/", pedidosController.crearPedido);

// Ruta activada para cambiar el estado del pedido
router.put("/:id/estado", pedidosController.cambiarEstado);

module.exports = router;
