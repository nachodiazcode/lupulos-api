import express from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} from '../controllers/followController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js'; // ⬅️ asegúrate de tener este middleware

const router = express.Router();

// 🔐 Rutas protegidas
router.post('/:id/follow', authMiddleware, followUser);
router.post('/:id/unfollow', authMiddleware, unfollowUser);

// 📋 Rutas públicas para ver seguidores/seguidos
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

export default router;
