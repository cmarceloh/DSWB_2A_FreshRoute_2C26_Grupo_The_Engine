const express = require("express");
const authController = require("../controllers/authController");
const { verificarToken } = require("../middlewares/auth");

// Registra las rutas de autenticación para vistas (Passport + sesiones) y para API (JWT)
module.exports = function (passport) {
  const router = express.Router();

  // Guarda una cookie con la fecha/hora de último acceso tras iniciar sesión
  const registrarCookieAcceso = (req, res, next) => {
    res.cookie("ultimoAcceso", new Date().toLocaleString("es-AR"), {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    });
    next();
  };

  // --- Rutas del Panel Web (Pug + Passport + Sesiones + Cookies) ---
  router.get("/login", authController.mostrarLogin);

  router.post(
    "/login",
    passport.authenticate("login", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    registrarCookieAcceso,
    (req, res) => res.redirect("/"),
  );

  router.get("/signup", authController.mostrarSignup);

  router.post(
    "/signup",
    passport.authenticate("signup", {
      failureRedirect: "/signup",
      failureFlash: true,
    }),
    registrarCookieAcceso,
    (req, res) => res.redirect("/"),
  );

  router.get("/signout", authController.cerrarSesion);
  router.post("/signout", authController.cerrarSesion);

  // --- Rutas de la API REST (Usuarios y Login con JWT - D10 págs. 26-42) ---
  router.get("/api/usuarios", authController.obtenerUsuarios);
  router.post("/api/usuarios", authController.crearUsuario);
  router.get("/api/users", authController.obtenerUsuarios);
  router.post("/api/users", authController.crearUsuario);

  router.post("/api/login", authController.loginApi);
  router.get("/api/perfil", verificarToken, authController.obtenerPerfil);

  return router;
};
