// Configura los endpoints REST y los asocia al controlador de repartidores.
const express = require("express");
const router = express.Router();
const repartidoresController = require("../controllers/repartidoresController");

// Lista los repartidores registrados.
router.get("/", repartidoresController.getRepartidores);

// Obtiene un repartidor por su ID.
router.get("/:id", repartidoresController.getRepartidorById);

// Registra un repartidor.
router.post("/", repartidoresController.createRepartidor);

// Actualiza un repartidor existente.
router.put("/:id", repartidoresController.updateRepartidor);

// Elimina un repartidor por su ID.
router.delete("/:id", repartidoresController.deleteRepartidor);

module.exports = router;
