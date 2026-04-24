import express from 'express';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import config from '../config/index.js';
import { createUpload } from '../config/upload.js';

import {
  loginUser,
  registerUser,
  logoutUser,
  refreshToken,
  getUserProfile,
  loginWithGoogle,
} from '../controllers/auth.controller.js';
import { updateUser } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/index.js';
import validateRequest from '../middlewares/validateRequest.js';
import { authValidation, userValidation } from '../validations/requestSchemas.js';
import { sendError, sendSuccess } from '../utils/responseHandler.js';

const router = express.Router();

const hasGoogleOAuth =
  Boolean(config.oauth?.google?.clientId) &&
  Boolean(config.oauth?.google?.clientSecret);

const ensureGoogleOAuth = (_req, res, next) => {
  if (!hasGoogleOAuth) {
    return sendError(res, {
      statusCode: 503,
      message:
        'Google OAuth no configurado. Define GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET.',
    });
  }
  return next();
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many auth requests, try again later.',
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, try again later.',
});

const profileUpload = createUpload('profiles', {
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      return callback(null, true);
    }
    return callback(new Error('Only image files are allowed'));
  },
});

/* Auth */
router.post(
  '/register',
  authLimiter,
  validateRequest(authValidation.register),
  registerUser
);

router.post(
  '/login',
  authLimiter,
  loginLimiter,
  validateRequest(authValidation.login),
  loginUser
);

router.post(
  '/logout',
  authLimiter,
  authMiddleware,
  validateRequest(authValidation.logout),
  logoutUser
);

router.post(
  '/refresh-token',
  authLimiter,
  validateRequest(authValidation.refreshToken),
  refreshToken
);

/* Profile */
router.get(
  '/profile/:userId',
  authMiddleware,
  validateRequest(authValidation.profileParams),
  getUserProfile
);

router.get(
  '/perfil/:userId',
  authMiddleware,
  validateRequest(authValidation.profileParams),
  getUserProfile
);

router.put(
  '/profile/:id',
  authMiddleware,
  validateRequest(userValidation.updateProfile),
  updateUser
);

router.put(
  '/perfil/:id',
  authMiddleware,
  validateRequest(userValidation.updateProfile),
  updateUser
);

router.post(
  '/upload/profile',
  authMiddleware,
  profileUpload.single('profilePicture'),
  (req, res) => {
    if (!req.file) {
      return sendError(res, {
        statusCode: 400,
        message: 'No image uploaded',
      });
    }

    return sendSuccess(res, {
      message: 'Profile image uploaded successfully',
      data: {
        path: `/uploads/profiles/${req.file.filename}`,
      },
    });
  }
);

/* Google OAuth */
router.get(
  '/google',
  ensureGoogleOAuth,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: true,
  })
);

router.get(
  '/google/callback',
  ensureGoogleOAuth,
  (req, res, next) => {
    passport.authenticate(
      'google',
      {
        session: false,
        state: true,
        failureRedirect: `${config.frontend.url || 'http://localhost:3000'}/auth/login`,
      },
      (error, user, info) => {
        if (error) {
          console.error('Google OAuth error:', error);
          return res.redirect(
            `${config.frontend.url || 'http://localhost:3000'}/auth/login?error=oauth_failed`
          );
        }
        if (!user) {
          console.error('No user returned from Google OAuth:', info);
          return res.redirect(
            `${config.frontend.url || 'http://localhost:3000'}/auth/login?error=no_user`
          );
        }
        req.user = user;
        return next();
      }
    )(req, res, next);
  },
  loginWithGoogle
);

export default router;
