import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs'; // asegúrate de tenerlo instalado
import User from '../models/User.js';
import config from '../config/config.js'; // Reutilizar config centralizado

// ✅ Validar envs críticos
if (!config.googleClientId || !config.googleClientSecret || !config.googleCallbackUrl) {
  throw new Error('❌ Faltan variables de entorno para Google OAuth');
}

// 📌 Estrategia de Google

passport.use(new GoogleStrategy(
  {
    clientID: config.googleClientId,
  clientSecret: config.googleClientSecret,
  callbackURL: config.googleCallbackUrl
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("🎯 Profile recibido de Google:", profile);

      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error("El perfil de Google no contiene email."), null);
      }

      let user = await User.findOne({ email });

      if (user) {
        console.log("✅ Usuario existente:", user.email);
      } else {
        user = new User({
          username: profile.displayName,
          email,
      fotoPerfil: profile.photos[0].value, // <-- ESTA ES LA CLAVE
          password: await bcrypt.hash(profile.id, 10), // se usa Google ID como clave dummy
          authProvider: "google", // 🔒 útil para saber cómo se registró el usuario
        });

        await user.save();
        console.log("🆕 Usuario creado con Google:", user.email);
      }

      return done(null, user);
    } catch (error) {
      console.error("❌ Error en estrategia Google:", error);
      return done(error, null);

    }
  }
));

// 🎒 Serialización
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
