// Rutas del panel web: protegidas mediante sesión de Passport (isAuthenticated).
const express = require("express");
const router = express.Router();
const vistasController = require("../controllers/vistasController");
const { isAuthenticated } = require("../middlewares/auth");

router.get("/", isAuthenticated, vistasController.mostrarPanel);

router.post("/agregar-cliente", isAuthenticated, vistasController.agregarCliente);
router.post("/agregar-producto", isAuthenticated, vistasController.agregarProducto);
router.post("/agregar-repartidor", isAuthenticated, vistasController.agregarRepartidor);
router.post("/agregar-pedido", isAuthenticated, vistasController.agregarPedido);

router.post("/eliminar-cliente/:id", isAuthenticated, vistasController.eliminarCliente);
router.post("/eliminar-producto/:id", isAuthenticated, vistasController.eliminarProducto);
router.post("/eliminar-pedido/:id", isAuthenticated, vistasController.eliminarPedido);
router.post("/eliminar-repartidor/:id", isAuthenticated, vistasController.eliminarRepartidor);

module.exports = router;
