import mongoose from 'mongoose';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Beer from '../models/Beer.js';
import Place from '../models/Place.js';
import Comment from '../models/Comment.js';
import RevokedToken from '../models/RevokedToken.js';
import logger from '../utils/logger.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendError, sendSuccess } from '../utils/responseHandler.js';
import { getRoleLevel, getAllPermissions } from '../config/permissions.js';

const publicProfileProjection =
  'username profilePicture bannerPicture bio city country favoriteStyle createdAt';

const writableProfileFields = [
  'username',
  'email',
  'bio',
  'city',
  'country',
  'profilePicture',
  'bannerPicture',
  'favoriteStyle',
  'isPublic',
];

const sanitizeUser = (user) => {
  if (!user) return user;
  const normalizedUser = user.toObject ? user.toObject() : user;
  delete normalizedUser.password;
  delete normalizedUser.refreshToken;
  return normalizedUser;
};

/* List users */
export const getUsers = asyncHandler(async (req, res) => {
  if (req.query.scope === 'public') {
    const users = await User.find({ isPublic: true }).select(publicProfileProjection);
    return sendSuccess(res, {
      message: 'Public users retrieved successfully',
      data: users,
    });
  }

  if (!req.user?.id) {
    return sendError(res, {
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const currentUser = await User.findById(req.user.id).select('-password -refreshToken');
  if (!currentUser) {
    return sendError(res, {
      statusCode: 404,
      message: 'User not found',
    });
  }

  return sendSuccess(res, {
    message: 'Current user profile retrieved successfully',
    data: sanitizeUser(currentUser),
  });
});

/* Get user by id */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid user id',
    });
  }

  const user = await User.findById(id).select('-password -refreshToken');
  if (!user) {
    return sendError(res, {
      statusCode: 404,
      message: 'User not found',
    });
  }

  return sendSuccess(res, {
    message: 'User retrieved successfully',
    data: sanitizeUser(user),
  });
});

/* Create user (admin / seed only) */
export const createUser = asyncHandler(async (req, res) => {
  const createdUser = await User.create(req.body);
  const user = await User.findById(createdUser._id).select('-password -refreshToken');

  return sendSuccess(res, {
    statusCode: 201,
    message: 'User created successfully',
    data: sanitizeUser(user),
  });
});

/* Update user */
export const updateUser = asyncHandler(async (req, res) => {
  const actorId = req.user?.id;
  const actorRole = req.user?.role;
  const targetUserId = req.params.id;

  if (
    actorId &&
    actorId !== targetUserId &&
    actorRole !== 'admin' &&
    actorRole !== 'owner'
  ) {
    return sendError(res, {
      statusCode: 403,
      message: 'Forbidden: cannot update another user profile',
    });
  }

  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => writableProfileFields.includes(key))
  );

  const user = await User.findByIdAndUpdate(targetUserId, updates, {
    new: true,
  }).select('-password -refreshToken');

  if (!user) {
    return sendError(res, {
      statusCode: 404,
      message: 'User not found',
    });
  }

  return sendSuccess(res, {
    message: 'User updated successfully',
    data: sanitizeUser(user),
  });
});

/* Delete user */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return sendError(res, {
      statusCode: 404,
      message: 'User not found',
    });
  }

  return sendSuccess(res, {
    message: 'User deleted successfully',
    data: {},
  });
});

/* ========================================
   Admin: Delete user (any provider)
======================================== */

/**
 * Hard-delete a user and clean up all related data.
 */
export const adminDeleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const actorRole = req.user.role;
  const actorId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid user id',
    });
  }

  if (actorId === id) {
    return sendError(res, {
      statusCode: 403,
      message: 'Cannot delete your own account through admin endpoint',
    });
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    return sendError(res, {
      statusCode: 404,
      message: 'User not found',
    });
  }

  if (targetUser.role === 'owner') {
    return sendError(res, {
      statusCode: 403,
      message: 'The owner account cannot be deleted',
    });
  }

  if (getRoleLevel(actorRole) <= getRoleLevel(targetUser.role)) {
    return sendError(res, {
      statusCode: 403,
      message: 'You cannot delete a user with equal or higher role',
    });
  }

  const userId = targetUser._id;

  await Promise.all([
    Post.deleteMany({ author: userId }),
    Beer.deleteMany({ createdBy: userId }),
    Place.deleteMany({ owner: userId }),
    Comment.deleteMany({ author: userId }),
    RevokedToken.deleteMany({ user: userId }),
    User.updateMany({ followers: userId }, { $pull: { followers: userId } }),
    User.updateMany({ following: userId }, { $pull: { following: userId } }),
  ]);

  await User.findByIdAndDelete(userId);

  logger.info(
    `User ${targetUser.username} (${userId}) deleted by ${actorRole} ${actorId}. Provider: ${targetUser.provider}`
  );

  return sendSuccess(res, {
    message: `User "${targetUser.username}" deleted successfully`,
    data: {
      deletedUser: {
        id: userId,
        username: targetUser.username,
        email: targetUser.email,
        role: targetUser.role,
        provider: targetUser.provider,
      },
    },
  });
});

/* ========================================
   Admin: Change user role
======================================== */

/**
 * Change the role of a user.
 */
export const changeUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role: newRole } = req.body;
  const actorRole = req.user.role;
  const actorId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid user id',
    });
  }

  const validRoles = ['user', 'moderator', 'admin'];
  if (!validRoles.includes(newRole)) {
    return sendError(res, {
      statusCode: 400,
      message: `Invalid role. Allowed: ${validRoles.join(', ')}`,
    });
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    return sendError(res, {
      statusCode: 404,
      message: 'User not found',
    });
  }

  if (targetUser.role === 'owner') {
    return sendError(res, {
      statusCode: 403,
      message: 'The owner role cannot be modified',
    });
  }

  if (newRole === 'admin' && actorRole !== 'owner') {
    return sendError(res, {
      statusCode: 403,
      message: 'Only the owner can promote users to admin',
    });
  }

  if (targetUser.role === 'admin' && actorRole !== 'owner') {
    return sendError(res, {
      statusCode: 403,
      message: 'Only the owner can modify admin roles',
    });
  }

  if (actorId === id && actorRole !== 'owner') {
    return sendError(res, {
      statusCode: 403,
      message: 'You cannot change your own role',
    });
  }

  const previousRole = targetUser.role;
  targetUser.role = newRole;
  await targetUser.save();

  logger.info(
    `Role changed: ${targetUser.username} (${id}) ${previousRole} → ${newRole} by ${actorRole} ${actorId}`
  );

  return sendSuccess(res, {
    message: `Role updated: ${previousRole} → ${newRole}`,
    data: {
      user: {
        id: targetUser._id,
        username: targetUser.username,
        email: targetUser.email,
        role: targetUser.role,
        provider: targetUser.provider,
      },
    },
  });
});

/* ========================================
   Admin: Manage custom permissions
======================================== */

/**
 * Update custom permissions for a user.
 */
export const updateUserPermissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;
  const actorRole = req.user.role;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid user id',
    });
  }

  if (!Array.isArray(permissions)) {
    return sendError(res, {
      statusCode: 400,
      message: 'permissions must be an array of strings',
    });
  }

  const validPermissions = getAllPermissions();
  const invalidPermissions = permissions.filter(
    (permission) => !validPermissions.includes(permission)
  );

  if (invalidPermissions.length > 0) {
    return sendError(res, {
      statusCode: 400,
      message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
      errors: invalidPermissions,
    });
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    return sendError(res, {
      statusCode: 404,
      message: 'User not found',
    });
  }

  if (targetUser.role === 'owner') {
    return sendError(res, {
      statusCode: 403,
      message: 'Owner already has all permissions',
    });
  }

  if (targetUser.role === 'admin' && actorRole !== 'owner') {
    return sendError(res, {
      statusCode: 403,
      message: 'Only the owner can modify admin permissions',
    });
  }

  targetUser.customPermissions = permissions;
  await targetUser.save();

  logger.info(
    `Permissions updated: ${targetUser.username} (${id}) → [${permissions.join(', ')}] by ${actorRole} ${req.user.id}`
  );

  return sendSuccess(res, {
    message: `Custom permissions updated for ${targetUser.username}`,
    data: {
      user: {
        id: targetUser._id,
        username: targetUser.username,
        role: targetUser.role,
        customPermissions: targetUser.customPermissions,
      },
    },
  });
});

/* Public profile */
export const getPublicProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid user id',
    });
  }

  const user = await User.findById(id).select(
    `${publicProfileProjection} isPublic`
  );

  if (!user) {
    return sendError(res, {
      statusCode: 404,
      message: 'User not found',
    });
  }

  const canSeePrivateProfile =
    req.user?.id === id || ['admin', 'owner'].includes(req.user?.role);

  if (!user.isPublic && !canSeePrivateProfile) {
    return sendError(res, {
      statusCode: 403,
      message: 'This profile is private',
    });
  }

  return sendSuccess(res, {
    message: 'Public profile retrieved successfully',
    data: sanitizeUser(user),
  });
});
