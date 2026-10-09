const express = require("express");
const router = express.Router();
const productosController = require("../controllers/productosController");

// Ruta para obtener todos los productos (soporta filtros ?nombre= y ?categoria=)
router.get("/", productosController.obtenerProductos);

// Ruta para obtener un producto especifico por su ID de MongoDB
router.get("/:id", productosController.obtenerProductoPorId);

// Ruta para registrar un nuevo producto en el sistema
router.post("/", productosController.crearProducto);

// Ruta para actualizar los datos generales de un producto por ID
router.put("/:id", productosController.actualizarProducto);

// Ruta para ajustar el stock de un producto (incrementar o decrementar)
router.patch("/:id/stock", productosController.ajustarStock);
router.put("/:id/stock", productosController.ajustarStock);

// Ruta para eliminar un producto por ID
router.delete("/:id", productosController.eliminarProducto);

module.exports = router;
