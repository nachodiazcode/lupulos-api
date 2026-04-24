import express from 'express';
import {
  authMiddleware,
  requirePermission,
  authGoogle,
  authFacebook,
} from '../middlewares/index.js';
import validateRequest from '../middlewares/validateRequest.js';
import { userValidation } from '../validations/requestSchemas.js';
import { sendSuccess } from '../utils/responseHandler.js';

import {
  getUsers,
  updateUser,
  getPublicProfile,
  adminDeleteUser,
  changeUserRole,
  updateUserPermissions,
} from '../controllers/user.controller.js';

import { followUser, unfollowUser } from '../controllers/follow.controller.js';

const router = express.Router();

// Admin routes (must be before /:id to avoid conflicts)
router.delete(
  '/admin/:id',
  authMiddleware,
  requirePermission('users:delete'),
  validateRequest(userValidation.userIdParam),
  adminDeleteUser
);

router.patch(
  '/admin/:id/role',
  authMiddleware,
  requirePermission('users:change-role'),
  validateRequest(userValidation.changeRole),
  changeUserRole
);

router.patch(
  '/admin/:id/permissions',
  authMiddleware,
  requirePermission('users:manage-permissions'),
  validateRequest(userValidation.updatePermissions),
  updateUserPermissions
);

router.get(
  '/admin/dashboard',
  authMiddleware,
  requirePermission('admin:dashboard'),
  (_req, res) =>
    sendSuccess(res, {
      message: 'Admin dashboard access granted',
      data: {},
    })
);

// Public routes
router.get(
  '/',
  authMiddleware,
  validateRequest(userValidation.scopeQuery),
  getUsers
);

router.get(
  '/:id',
  validateRequest(userValidation.userIdParam),
  getPublicProfile
);

// Authenticated routes
router.put(
  '/:id',
  authMiddleware,
  validateRequest(userValidation.updateProfile),
  updateUser
);

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

// Provider-gated routes
router.get(
  '/zone/google',
  authMiddleware,
  authGoogle,
  (_req, res) =>
    sendSuccess(res, {
      message: 'Google-authenticated area access granted',
      data: {},
    })
);

router.get(
  '/zone/facebook',
  authMiddleware,
  authFacebook,
  (_req, res) =>
    sendSuccess(res, {
      message: 'Facebook-authenticated area access granted',
      data: {},
    })
);

export default router;
