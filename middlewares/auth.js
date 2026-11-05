const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const obtenerSecreto = () =>
  process.env.SECRET || "freshroute_the_engine_secret_key_2026";

// Extrae el token del encabezado Authorization: Bearer <token> o de la cookie (D10, pág. 41)
const getTokenFrom = (req) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
};

// Protege las rutas del panel web verificando la sesión de Passport (D10, pág. 59 y 66)
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/login");
};

// Verifica autenticación en endpoints de la API mediante token JWT o sesión activa (D10, pág. 41)
const verificarToken = async (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    req.usuario = req.user;
    return next();
  }

  const token = getTokenFrom(req);
  if (!token) {
    return res.status(401).json({ error: "token missing or invalid" });
  }

  const decodedToken = jwt.verify(token, obtenerSecreto());
  if (!decodedToken.id) {
    return res.status(401).json({ error: "token missing or invalid" });
  }

  const usuario = await Usuario.findById(decodedToken.id);
  if (!usuario) {
    return res.status(401).json({ error: "token missing or invalid" });
  }

  req.usuario = usuario;
  next();
};

module.exports = {
  isAuthenticated,
  verificarToken,
  getTokenFrom,
  obtenerSecreto,
};
