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
passport.use(new GoogleStrategy({
  clientID: config.googleClientId,
  clientSecret: config.googleClientSecret,
  callbackURL: config.googleCallbackUrl,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return done(null, existingUser);
    }

    // ✅ Crear nuevo usuario si no existe
    const newUser = new User({
      username: profile.displayName,
      email,
      fotoPerfil: profile.photos?.[0]?.value || '',
      password: await bcrypt.hash(profile.id, 10), // Contraseña fake
    });

    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
}));

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
