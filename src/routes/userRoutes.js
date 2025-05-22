import express from "express";
import {
  authMiddleware,
  isAdmin,
  isUser,
  isPremium,
  authGoogle,
  authFacebook
} from "../middlewares/index.js";

import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  getPerfilPublico
} from "../controllers/userController.js";

import { followUser, unfollowUser } from "../controllers/followController.js";

const router = express.Router();

// ✅ Obtener todos los usuarios (pública o protegida según prefieras)
router.get("/", getUsers);

// ✅ Obtener perfil público por ID (¡importante que vaya después de "/"!)
router.get("/:id", getPerfilPublico);

// 🔁 Seguir / Dejar de seguir
router.post("/:id/follow", authMiddleware, followUser);
router.post("/:id/unfollow", authMiddleware, unfollowUser);

// 🔒 Rutas protegidas de ejemplo
router.get("/admin/dashboard", authMiddleware, isAdmin, (req, res) => {
  res.json({ exito: true, mensaje: "Bienvenido, Admin 👑" });
});

router.get("/usuario/perfil", authMiddleware, isUser, (req, res) => {
  res.json({ exito: true, mensaje: "Perfil de usuario 👤" });
});

router.get("/beneficios/premium", authMiddleware, isPremium, (req, res) => {
  res.json({ exito: true, mensaje: "Acceso premium desbloqueado 💎" });
});

router.get("/zona/google", authMiddleware, authGoogle, (req, res) => {
  res.json({ exito: true, mensaje: "Bienvenido usuario Google 🌐" });
});

router.get("/zona/facebook", authMiddleware, authFacebook, (req, res) => {
  res.json({ exito: true, mensaje: "Bienvenido usuario Facebook 📘" });
});

export default router;
