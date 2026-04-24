import express from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} from '../controllers/follow.controller.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import { userValidation } from '../validations/requestSchemas.js';

const router = express.Router();

// Protected
router.post(
  '/:id/follow',
  authMiddleware,
  validateRequest(userValidation.userIdParam),
  followUser
);

router.post(
  '/:id/unfollow',
  authMiddleware,
  validateRequest(userValidation.userIdParam),
  unfollowUser
);

// Public
router.get(
  '/:id/followers',
  validateRequest(userValidation.userIdParam),
  getFollowers
);

router.get(
  '/:id/following',
  validateRequest(userValidation.userIdParam),
  getFollowing
);

export default router;
