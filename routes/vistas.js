// Rutas del panel web: la página principal y las acciones de sus formularios.
const express = require("express");
const router = express.Router();
const vistasController = require("../controllers/vistasController");

router.get("/", vistasController.mostrarPanel);

router.post("/agregar-cliente", vistasController.agregarCliente);
router.post("/agregar-producto", vistasController.agregarProducto);
router.post("/agregar-repartidor", vistasController.agregarRepartidor);
router.post("/agregar-pedido", vistasController.agregarPedido);

router.post("/eliminar-cliente/:id", vistasController.eliminarCliente);
router.post("/eliminar-producto/:id", vistasController.eliminarProducto);
router.post("/eliminar-pedido/:id", vistasController.eliminarPedido);
router.post("/eliminar-repartidor/:id", vistasController.eliminarRepartidor);

module.exports = router;
