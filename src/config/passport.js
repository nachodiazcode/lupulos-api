import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js"; // asegúrate que la ruta esté bien
import dotenv from "dotenv";
dotenv.config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let usuario = await User.findOne({ email: profile.emails[0].value });

    if (!usuario) {
      usuario = new User({
        username: profile.displayName,
        email: profile.emails[0].value,
        fotoPerfil: profile.photos[0].value,
        password: await bcrypt.hash(profile.id, 10), // genera una "clave falsa"
      });
      await usuario.save();
    }

    return done(null, usuario);
  } catch (error) {
    return done(error, null);
  }
}));

// Para usar req.user
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
