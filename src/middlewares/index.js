import authMiddleware, {
    verifyToken,
    validateRevokedToken,
    requirePermission,
    hasRole,
    isOwner,
    isAdmin,
    isModerator,
    isUser,
    authGoogle,
    authFacebook,
} from './authMiddleware.js';

import { requirePlan, requireFeature } from './planMiddleware.js';
import errorHandler from './errorHandler.js';

export {
    authMiddleware,
    verifyToken,
    validateRevokedToken,
    requirePermission,
    requirePlan,
    requireFeature,
    hasRole,
    isOwner,
    isAdmin,
    isModerator,
    isUser,
    authGoogle,
    authFacebook,
    errorHandler,
};
