const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const Usuario = require("../models/Usuario");

// Estrategia local de inicio de sesión con Passport y bcrypt (D10, pág. 55)
module.exports = function (passport) {
  passport.use(
    "login",
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
          const user = await Usuario.findOne({ username: username.trim() });

          if (!user) {
            return done(
              null,
              false,
              req.flash("message", "Usuario o contraseña inválidos"),
            );
          }

          const passwordCorrect = await bcrypt.compare(
            password,
            user.passwordHash,
          );
          if (!passwordCorrect) {
            return done(
              null,
              false,
              req.flash("message", "Usuario o contraseña inválidos"),
            );
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
};
