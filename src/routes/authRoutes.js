import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import rateLimit from 'express-rate-limit';
import passport from 'passport';

import {
  loginUser,
  registerUser,
  logoutUser,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getPerfilUsuario,
  loginWithGoogle,
  actualizarPerfilUsuario
} from '../controllers/authController.js';

const router = express.Router();

// ✅ Para reemplazar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ───────────────────────────────────────────────
   🛡️ Seguridad: Limitador de intentos de login
─────────────────────────────────────────────── */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: '⚠️ Demasiados intentos de inicio de sesión, intenta nuevamente más tarde.'
});

/* ───────────────────────────────────────────────
   🖼️ Configuración de subida de foto de perfil
─────────────────────────────────────────────── */
const profileDir = path.join(__dirname, "../uploads/profiles");

if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

/* ───────────────────────────────────────────────
   🔐 Rutas de Autenticación
─────────────────────────────────────────────── */
router.post('/register', registerUser);
router.post('/login', loginLimiter, loginUser);
router.post('/logout', logoutUser);
router.post('/refresh-token', refreshToken);

/* ───────────────────────────────────────────────
   📧 Verificación y recuperación
─────────────────────────────────────────────── */
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

/* ───────────────────────────────────────────────
   👤 Perfil de Usuario
─────────────────────────────────────────────── */
router.get('/perfil/:userId', getPerfilUsuario);
router.put('/perfil/:userId', actualizarPerfilUsuario);

/* ───────────────────────────────────────────────
   🖼️ Subida de Foto de Perfil
─────────────────────────────────────────────── */
router.post("/upload/profile", upload.single("fotoPerfil"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ exito: false, mensaje: "❌ No se subió ninguna imagen." });
  }

  const ruta = `/uploads/profiles/${req.file.filename}`;
  console.log("✅ Foto subida:", ruta);
  res.status(200).json({ exito: true, mensaje: "Imagen subida", ruta });
});

/* ───────────────────────────────────────────────
   🔐 Autenticación con Google
─────────────────────────────────────────────── */
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

router.get("/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/login"
  }),
  loginWithGoogle
);

export default router;
