// Rutas HTTP de respaldo y API para el Chat Operativo y FreshBot
const express = require("express");
const router = express.Router();
const { messages, procesarNuevoMensaje } = require("../socket/chat");

// GET /api/chat - Devuelve el historial de mensajes del chat y FreshBot
router.get("/", (_req, res) => {
  res.json(messages);
});

// POST /api/chat - Envía un mensaje al chat y dispara el asistente FreshBot
router.post("/", async (req, res, next) => {
  try {
    const { author, text } = req.body || {};
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "El mensaje (text) es obligatorio" });
    }
    const resultado = await procesarNuevoMensaje({ author, text });
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
