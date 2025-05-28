import express from 'express';
import {
  createMessage,
  updateMessage,
  deleteMessage,
  likeMessage,
  reactToMessage,
} from '../controllers/MessageController.js';

const router = express.Router();

router.post('/', createMessage);
router.put('/:messageId', updateMessage);
router.delete('/:messageId', deleteMessage);
router.post('/:messageId/like', likeMessage);
router.post('/:messageId/react', reactToMessage);

export default router;
