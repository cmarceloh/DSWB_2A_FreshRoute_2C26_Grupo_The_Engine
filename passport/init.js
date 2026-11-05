const login = require("./login");
const signup = require("./signup");
const Usuario = require("../models/Usuario");

// Serializa y deserializa la instancia de usuario en la sesión (D10, pág. 53).
// En la cookie del navegador sólo viaja el ID de sesión; en la sesión del servidor
// sólo guardamos el _id del usuario y lo recuperamos en cada petición.
module.exports = function (passport) {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Usuario.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Inicializa las estrategias de Passport para login y registro
  login(passport);
  signup(passport);
};
