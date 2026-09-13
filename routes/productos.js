const express = require("express");
const router = express.Router();
const productosController = require("../controllers/productosController");

// Definir las rutas
router.get("/", productosController.obtenerProductos);
router.get("/:id", productosController.obtenerProductoPorId);
router.post("/", productosController.crearProducto);
router.put("/:id", productosController.actualizarProducto);

// Ruta activada para ajustar el stock del producto
router.put("/:id/stock", productosController.ajustarStock);

router.delete("/:id", productosController.eliminarProducto);

module.exports = router;
