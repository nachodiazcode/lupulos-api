import test from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REFRESH_SECRET = 'test-refresh-secret';
process.env.SESSION_SECRET = 'test-session-secret';

const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } =
  await import('../src/utils/jwt.js');

test('JWT auth tokens preserve provider for Google login', () => {
  const accessToken = generateAccessToken('user-123', 'user', {
    provider: 'google',
  });
  const refreshToken = generateRefreshToken('user-123', 'user', {
    provider: 'google',
  });

  const accessPayload = verifyAccessToken(accessToken);
  const refreshPayload = verifyRefreshToken(refreshToken);

  assert.equal(accessPayload.userId, 'user-123');
  assert.equal(accessPayload.role, 'user');
  assert.equal(accessPayload.provider, 'google');
  assert.equal(refreshPayload.provider, 'google');
});

test('JWT auth tokens stay backward-compatible when provider is omitted', () => {
  const accessToken = generateAccessToken('user-456', 'admin');
  const payload = verifyAccessToken(accessToken);

  assert.equal(payload.userId, 'user-456');
  assert.equal(payload.role, 'admin');
  assert.equal(payload.provider, undefined);
});
