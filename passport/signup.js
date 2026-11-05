const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const Usuario = require("../models/Usuario");

// Estrategia local de registro de nuevos usuarios con Passport y bcrypt (D10, pág. 56-57)
module.exports = function (passport) {
  passport.use(
    "signup",
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
          const cleanUsername = username?.trim();
          const name = req.body.name?.trim() || cleanUsername;

          if (!cleanUsername || cleanUsername.length < 3) {
            return done(
              null,
              false,
              req.flash(
                "message",
                "El usuario debe tener al menos 3 caracteres",
              ),
            );
          }

          if (!password || password.length < 4) {
            return done(
              null,
              false,
              req.flash(
                "message",
                "La contraseña debe tener al menos 4 caracteres",
              ),
            );
          }

          const existente = await Usuario.findOne({ username: cleanUsername });
          if (existente) {
            return done(
              null,
              false,
              req.flash("message", "El nombre de usuario ya está registrado"),
            );
          }

          const saltRounds = 10;
          const passwordHash = await bcrypt.hash(password, saltRounds);

          const nuevoUsuario = await Usuario.create({
            username: cleanUsername,
            name,
            passwordHash,
          });

          return done(null, nuevoUsuario);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
};
