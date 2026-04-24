import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import RevokedToken from '../models/RevokedToken.js';

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$/;

export const hashToken = (token = '') =>
  crypto.createHash('sha256').update(token).digest('hex');

export const isBcryptHash = (value = '') =>
  BCRYPT_HASH_REGEX.test(value);

export const hashRefreshToken = (refreshToken) =>
  bcrypt.hash(refreshToken, 12);

export const compareRefreshToken = async (plainToken, storedToken) => {
  if (!plainToken || !storedToken) return false;

  if (isBcryptHash(storedToken)) {
    return bcrypt.compare(plainToken, storedToken);
  }

  // Backward compatibility: allows migration from legacy plain refresh tokens.
  return plainToken === storedToken;
};

export const getTokenExpiration = (token, fallbackMinutes = 15) => {
  const decoded = jwt.decode(token);
  if (decoded?.exp) {
    return new Date(decoded.exp * 1000);
  }

  const fallbackDate = new Date();
  fallbackDate.setMinutes(fallbackDate.getMinutes() + fallbackMinutes);
  return fallbackDate;
};

export const revokeToken = async ({
  token,
  userId,
  reason = 'logout',
  fallbackMinutes = 15,
}) => {
  if (!token || !userId) return;

  const tokenHash = hashToken(token);
  const expiresAt = getTokenExpiration(token, fallbackMinutes);

  await RevokedToken.updateOne(
    { tokenHash },
    {
      $setOnInsert: {
        tokenHash,
        user: userId,
        reason,
        expiresAt,
      },
    },
    { upsert: true }
  );
};

export const isTokenRevoked = async (token) => {
  if (!token) return false;

  const tokenHash = hashToken(token);
  const revoked = await RevokedToken.exists({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  return Boolean(revoked);
};
