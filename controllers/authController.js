const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Usuario = require("../models/Usuario");
const ErrorDeValidacion = require("../models/ErrorDeValidacion");
const { obtenerSecreto } = require("../middlewares/auth");

// Renderiza la vista de inicio de sesión (D10, pág. 59)
exports.mostrarLogin = (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect("/");
  }
  const mensajes = req.flash ? req.flash("message") : [];
  res.render("login", {
    titulo: "Iniciar sesión — FreshRoute",
    message: mensajes[0] || null,
  });
};

// Renderiza la vista de registro de nuevo usuario (D10, pág. 59)
exports.mostrarSignup = (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect("/");
  }
  const mensajes = req.flash ? req.flash("message") : [];
  res.render("register", {
    titulo: "Crear cuenta — FreshRoute",
    message: mensajes[0] || null,
  });
};

// Cierra la sesión activa en el servidor y limpia las cookies (D10, pág. 59 y 65)
exports.cerrarSesion = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    if (req.session) {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.clearCookie("ultimoAcceso");
        res.clearCookie("token");
        res.redirect("/login");
      });
    } else {
      res.clearCookie("ultimoAcceso");
      res.clearCookie("token");
      res.redirect("/login");
    }
  });
};

// API: Crea un nuevo usuario hasheando la contraseña con bcrypt (D10, pág. 26)
exports.crearUsuario = async (req, res) => {
  const { username, name, password } = req.body;

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    throw new ErrorDeValidacion(
      "El nombre de usuario es obligatorio y debe tener al menos 3 caracteres",
    );
  }

  if (!password || typeof password !== "string" || password.length < 4) {
    throw new ErrorDeValidacion(
      "La contraseña es obligatoria y debe tener al menos 4 caracteres",
    );
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new Usuario({
    username: username.trim(),
    name: name?.trim() || username.trim(),
    passwordHash,
  });

  const savedUser = await user.save();
  res.status(201).json(savedUser);
};

// API: Lista todos los usuarios registrados sin exponer passwordHash (D10, pág. 29)
exports.obtenerUsuarios = async (req, res) => {
  const users = await Usuario.find({});
  res.status(200).json(users);
};

// API: Autentica usuario con credenciales y devuelve un JWT firmado (D10, pág. 37)
exports.loginApi = async (req, res) => {
  const { username, password } = req.body;

  const user =
    typeof username === "string"
      ? await Usuario.findOne({ username: username.trim() })
      : null;

  const passwordCorrect =
    user === null || typeof password !== "string"
      ? false
      : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: "invalid username or password",
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  // Firma el token con expiración de 1 hora (3600 segundos, D10 pág. 15)
  const token = jwt.sign(userForToken, obtenerSecreto(), {
    expiresIn: 3600,
  });

  // Guarda el token en una cookie httpOnly para navegación segura
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 3600 * 1000,
  });

  res.status(200).send({
    token,
    username: user.username,
    name: user.name,
  });
};

// API: Devuelve los datos del usuario autenticado (sesión o JWT)
exports.obtenerPerfil = async (req, res) => {
  res.status(200).json({
    usuario: req.usuario,
  });
};
