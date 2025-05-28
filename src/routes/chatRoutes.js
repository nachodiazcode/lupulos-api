import express from "express";
import {
  getUserChats,
  getChatMessages,
  createChat,
  deleteChatForUser,
  renameChat,
  addUserToChat,
  removeUserFromChat
} from "../controllers/chatController.js";

const router = express.Router();

// 🟢 Obtener todos los chats de un usuario
router.get("/:userId", getUserChats);

// 🟢 Obtener mensajes de un chat específico
router.get("/messages/:chatId", getChatMessages);

// 🆕 Crear un nuevo chat (1 a 1 o grupal)
router.post("/", createChat);

// 🗑️ Eliminar chat para un usuario (soft delete)
router.patch("/:chatId/delete", deleteChatForUser);

// ✏️ Renombrar chat y guardar historial
router.patch("/:chatId/rename", renameChat);

// ➕ Agregar usuario al chat
router.patch("/:chatId/add-user", addUserToChat);

// ➖ Quitar usuario del chat
router.patch("/:chatId/remove-user", removeUserFromChat);

export default router;
