// Responde con JSON cuando ninguna ruta coincide con la petición.
const notFound = (req, res) => {
  res.status(404).json({ error: "Endpoint no encontrado" });
};

module.exports = notFound;
