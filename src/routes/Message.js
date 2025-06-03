import express from 'express';
import {
  createMessage,
  updateMessage,
  deleteMessage,
  likeMessage,
  reactToMessage,
} from '../controllers/MessageController.js';

const router = express.Router();

// 🟢 Crear mensaje
router.post('/', createMessage);

// ✏️ Editar mensaje
router.put('/:messageId', updateMessage);

// 🗑️ Eliminar mensaje (soft delete)
router.delete('/:messageId', deleteMessage);

// 👍 Dar like a un mensaje
router.post('/:messageId/like', likeMessage);

// 😊 Reaccionar a un mensaje con emoji
router.post('/:messageId/react', reactToMessage);

export default router;
