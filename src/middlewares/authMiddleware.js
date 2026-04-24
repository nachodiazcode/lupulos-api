import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { getRoleLevel, userHasPermission } from '../config/permissions.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { isTokenRevoked } from '../utils/tokenSecurity.js';
import { sendError } from '../utils/responseHandler.js';

/* ═══════════════════════════════════
   Token validation
═══════════════════════════════════ */

const getBearerToken = (req) => {
  const authHeader = req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};

export const validateRevokedToken = asyncHandler(async (req, res, next) => {
  const token = req.accessToken || getBearerToken(req);

  if (!token) {
    return sendError(res, {
      statusCode: 401,
      message: 'Access token not provided',
    });
  }

  const revoked = await isTokenRevoked(token);
  if (revoked) {
    logger.warn('Blocked request with revoked token');
    return sendError(res, {
      statusCode: 401,
      message: 'Token has been revoked',
    });
  }

  req.accessToken = token;
  return next();
});

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.accessToken || getBearerToken(req);

  if (!token) {
    logger.debug(`Authorization header missing: ${req.method} ${req.originalUrl}`);
    return sendError(res, {
      statusCode: 401,
      message: 'Access token not provided',
    });
  }

  const revoked = await isTokenRevoked(token);
  if (revoked) {
    logger.warn('Authentication blocked: revoked token');
    return sendError(res, {
      statusCode: 401,
      message: 'Token has been revoked',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    req.user = {
      id: decoded.id || decoded._id || decoded.userId || null,
      role: decoded.role || 'user',
      provider: decoded.provider || 'local',
      ...decoded,
    };

    logger.info(`Authenticated user: ${req.user.id}`);
    return next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    return sendError(res, {
      statusCode: 401,
      message: 'Invalid or expired token',
    });
  }
});

export const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.accessToken || getBearerToken(req);

  if (!token) {
    return sendError(res, {
      statusCode: 401,
      message: 'Access denied. Token not provided',
    });
  }

  const revoked = await isTokenRevoked(token);
  if (revoked) {
    return sendError(res, {
      statusCode: 401,
      message: 'Token has been revoked',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    req.user = {
      id: decoded.id || decoded._id || decoded.userId || null,
      role: decoded.role || 'user',
      provider: decoded.provider || 'local',
      ...decoded,
    };

    return next();
  } catch (error) {
    logger.warn(`Access denied: ${error.message}`);
    return sendError(res, {
      statusCode: 403,
      message: 'Invalid or expired token',
    });
  }
});

/* ═══════════════════════════════════
   Permission-based authorization
═══════════════════════════════════ */

export const requirePermission = (permission) => async (req, res, next) => {
  try {
    const role = req.user?.role;
    if (!role) {
      return sendError(res, {
        statusCode: 403,
        message: 'Role not found in token',
      });
    }

    const { roleHasPermission } = await import('../config/permissions.js');
    if (roleHasPermission(role, permission)) {
      return next();
    }

    const user = await User.findById(req.user.id).select('customPermissions');
    if (user?.customPermissions?.length > 0) {
      if (userHasPermission(role, user.customPermissions, permission)) {
        return next();
      }
    }

    return sendError(res, {
      statusCode: 403,
      message: `Missing permission: ${permission}`,
    });
  } catch (error) {
    next(error);
  }
};

/* ═══════════════════════════════════
   Role-based authorization (backward-compatible)
═══════════════════════════════════ */

export const hasRole = (...allowedRoles) => (req, res, next) => {
  const userRole = req.user?.role;
  if (!userRole) {
    return sendError(res, {
      statusCode: 403,
      message: 'Role not found in token',
    });
  }

  const userLevel = getRoleLevel(userRole);
  const requiredLevel = Math.min(...allowedRoles.map((role) => getRoleLevel(role)));

  if (userLevel >= requiredLevel) {
    return next();
  }

  return sendError(res, {
    statusCode: 403,
    message: `Requires role: ${allowedRoles.join(' | ')}`,
  });
};

export const isOwner = hasRole('owner');
export const isAdmin = hasRole('admin');
export const isModerator = hasRole('moderator');
export const isUser = hasRole('user');

/* ═══════════════════════════════════
   Provider-based authorization
═══════════════════════════════════ */

export const authGoogle = (req, res, next) => {
  if (req.user?.provider === 'google') return next();
  return sendError(res, {
    statusCode: 403,
    message: 'Google authentication required',
  });
};

export const authFacebook = (req, res, next) => {
  if (req.user?.provider === 'facebook') return next();
  return sendError(res, {
    statusCode: 403,
    message: 'Facebook authentication required',
  });
};

export default authMiddleware;
