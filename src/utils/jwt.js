import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const ACCESS_SECRET = config.jwt.accessSecret;
const REFRESH_SECRET_KEY = config.jwt.refreshSecret;
const ACCESS_EXPIRATION = config.jwt.accessExpiration || '15m';
const REFRESH_EXPIRATION = config.jwt.refreshExpiration || '7d';

/**
 * Generic token signer
 */
const signToken = (payload, secret, expiresIn) =>
  jwt.sign(payload, secret, { expiresIn });

/**
 * Generic token verifier
 */
const verifyToken = (token, secret) =>
  jwt.verify(token, secret);

const buildAuthPayload = (userId, role, extra = {}) => {
  const payload = {
    userId,
    role,
  };

  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined && value !== null && value !== '') {
      payload[key] = value;
    }
  }

  return payload;
};

/* ================================
   Public API
   (Keep names stable to avoid
   breaking existing imports)
================================ */

export const generateAccessToken = (userId, role = 'user', extra = {}) =>
  signToken(
    buildAuthPayload(userId, role, extra),
    ACCESS_SECRET,
    ACCESS_EXPIRATION
  );

export const generateRefreshToken = (userId, role = 'user', extra = {}) =>
  signToken(
    buildAuthPayload(userId, role, extra),
    REFRESH_SECRET_KEY,
    REFRESH_EXPIRATION
  );

export const verifyAccessToken = (token) =>
  verifyToken(token, ACCESS_SECRET);

export const verifyRefreshToken = (token) =>
  verifyToken(token, REFRESH_SECRET_KEY);
