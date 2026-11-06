// Define la aplicación Express (sin abrir el puerto),
// para poder importarla desde index.js, Vercel y los tests.
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");

const conectarDB = require("./config/db");
const initPassport = require("./passport/init");
const { obtenerSecreto } = require("./middlewares/auth");
const { errorHandler } = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");

const app = express();

// 0. En entornos serverless (Vercel), asegura conexión activa a MongoDB Atlas antes de procesar
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 0) {
    await conectarDB();
  }
  next();
});

// 1. Middlewares para procesar datos de peticiones HTTP y cookies (D10, pág. 50)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 2. Configuración de sesiones y Passport (D10, pág. 50 y 52)
app.use(
  expressSession({
    secret: obtenerSecreto(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hora
    },
  }),
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
initPassport(passport);

// 3. Archivos estáticos (CSS, cliente WebSockets public/main.js)
app.use(express.static(path.join(__dirname, "public")));

// 4. Configuración del Motor de Plantillas (Pug)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// 5. Rutas de autenticación (Login, Signup, Signout y API JWT)
app.use("/", require("./routes/auth")(passport));

// 6. Rutas del panel web (vistas Pug y formularios protegidos con sesión)
app.use("/", require("./routes/vistas"));

// 7. Rutas de la API REST y Chatbot
app.use("/api/pedidos", require("./routes/pedidos"));
app.use("/api/clientes", require("./routes/clientes"));
app.use("/api/productos", require("./routes/productos"));
app.use("/api/repartidores", require("./routes/repartidores"));
app.use("/api/chat", require("./routes/chat"));

// 8. Rutas inexistentes y manejo de errores (siempre al final)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
