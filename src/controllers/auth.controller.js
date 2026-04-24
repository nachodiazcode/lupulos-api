import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Post from '../models/Post.js';
import Beer from '../models/Beer.js';
import Place from '../models/Place.js';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';

import config from '../config/index.js';
import logger from '../utils/logger.js';
import { sendError, sendSuccess } from '../utils/responseHandler.js';
import {
  compareRefreshToken,
  hashRefreshToken,
  isBcryptHash,
  isTokenRevoked,
  revokeToken,
} from '../utils/tokenSecurity.js';

const issueAuthTokens = (user) => {
  const tokenPayload = {
    provider: user.provider || 'local',
  };

  return {
    accessToken: generateAccessToken(user._id, user.role, tokenPayload),
    refreshToken: generateRefreshToken(user._id, user.role, tokenPayload),
  };
};

/**
 * Register a new user
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, profilePicture } = req.body;

    if (!password?.trim()) {
      return sendError(res, {
        statusCode: 400,
        message: 'Password is required',
        errors: ['password'],
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      profilePicture: profilePicture || undefined,
    });

    const { accessToken, refreshToken } = issueAuthTokens(user);

    user.refreshToken = await hashRefreshToken(refreshToken);
    await user.save();

    return sendSuccess(res, {
      statusCode: 201,
      message: 'User registered successfully',
      data: {
        accessToken,
        refreshToken,
        user: buildUserResponse(user),
      },
    });
  } catch (error) {
    logger.error(`Register error: ${error.message}`);
    return sendError(res, {
      statusCode: 500,
      message: 'Failed to register user',
      errors: [error.message],
    });
  }
};

/**
 * Local login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select('+password')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');

    if (!user) {
      return sendError(res, {
        statusCode: 401,
        message: 'User not found',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return sendError(res, {
        statusCode: 401,
        message: 'Invalid credentials',
      });
    }

    const { accessToken, refreshToken } = issueAuthTokens(user);

    user.refreshToken = await hashRefreshToken(refreshToken);
    await user.save();

    return sendSuccess(res, {
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: buildUserResponse(user),
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return sendError(res, {
      statusCode: 500,
      message: 'Login failed',
      errors: [error.message],
    });
  }
};

/**
 * Google OAuth callback
 */
export const loginWithGoogle = async (req, res) => {
  try {
    const user = req.user;
    const frontendUrl = (config.frontend?.url || '').replace(/\/$/, '');

    const { accessToken, refreshToken } = issueAuthTokens(user);

    user.refreshToken = await hashRefreshToken(refreshToken);
    await user.save();

    const params = new URLSearchParams({
      token: accessToken,
      refreshToken,
    });

    return res.redirect(`${frontendUrl}/auth/google/success?${params.toString()}`);
  } catch (error) {
    logger.error(`Google login error: ${error.message}`);
    const frontendUrl = (config.frontend?.url || '').replace(/\/$/, '');
    return res.redirect(`${frontendUrl}/auth/login?error=google_login_failed`);
  }
};

/**
 * Logout user
 */
export const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const accessToken = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;
    const refreshToken =
      req.body?.refreshToken || req.headers['x-refresh-token'] || null;
    const userId = req.user?.id;

    if (!userId || !accessToken) {
      return sendError(res, {
        statusCode: 400,
        message: 'Access token not provided',
      });
    }

    const user = await User.findById(userId).select('refreshToken');

    await revokeToken({
      token: accessToken,
      userId,
      reason: 'logout',
      fallbackMinutes: 15,
    });

    if (refreshToken && user?.refreshToken) {
      const refreshTokenMatches = await compareRefreshToken(
        refreshToken,
        user.refreshToken
      );

      if (refreshTokenMatches) {
        await revokeToken({
          token: refreshToken,
          userId,
          reason: 'logout',
          fallbackMinutes: 60 * 24 * 7,
        });
      }
    }

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    return sendSuccess(res, {
      message: 'Logged out and tokens invalidated successfully',
      data: {},
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    return sendError(res, {
      statusCode: 500,
      message: 'Logout failed',
      errors: [error.message],
    });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return sendError(res, {
        statusCode: 401,
        message: 'Refresh token not provided',
      });
    }

    const tokenRevoked = await isTokenRevoked(token);
    if (tokenRevoked) {
      return sendError(res, {
        statusCode: 403,
        message: 'Refresh token has been revoked',
      });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId).select(
      'refreshToken role provider'
    );

    if (!user) {
      return sendError(res, {
        statusCode: 403,
        message: 'Invalid refresh token',
      });
    }

    const refreshTokenMatches = await compareRefreshToken(token, user.refreshToken);
    if (!refreshTokenMatches) {
      return sendError(res, {
        statusCode: 403,
        message: 'Invalid refresh token',
      });
    }

    // Automatic migration path for legacy plain refresh tokens.
    if (user.refreshToken && !isBcryptHash(user.refreshToken)) {
      user.refreshToken = await hashRefreshToken(token);
      await user.save();
    }

    const newAccessToken = generateAccessToken(user._id, user.role, {
      provider: user.provider || decoded.provider || 'local',
    });

    return sendSuccess(res, {
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`);
    return sendError(res, {
      statusCode: 500,
      message: 'Failed to refresh token',
      errors: [error.message],
    });
  }
};

/**
 * User profile
 */
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');

    if (!user) {
      return sendError(res, {
        statusCode: 404,
        message: 'User not found',
      });
    }

    const [posts, beers, places] = await Promise.all([
      Post.find({ author: userId }),
      Beer.find({ createdBy: userId }),
      Place.find({ owner: userId }),
    ]);

    return sendSuccess(res, {
      message: 'User profile loaded successfully',
      data: {
        user: buildUserResponse(user),
        stats: {
          posts: posts.length,
          beers: beers.length,
          places: places.length,
          followers: user.followers.length,
          following: user.following.length,
        },
      },
    });
  } catch (error) {
    logger.error(`Profile error: ${error.message}`);
    return sendError(res, {
      statusCode: 500,
      message: 'Failed to load profile',
      errors: [error.message],
    });
  }
};

/**
 * Helpers
 */
const buildUserResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  provider: user.provider,
  profilePicture: user.profilePicture,
  followers: user.followers || [],
  following: user.following || [],
  createdAt: user.createdAt,
});
