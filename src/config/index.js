import dotenv from 'dotenv';

// Load .env, then environment-specific file as fallback
dotenv.config();
const envFile = (process.env.NODE_ENV || 'development') === 'production'
  ? '.env.prod'
  : '.env.local';
dotenv.config({ path: envFile });

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://lupulos.app').replace(/\/$/, '');
const DEFAULT_CORS_ORIGINS = [FRONTEND_URL, 'http://localhost:3000'];

const parseCsv = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const toUnique = (values = []) => [...new Set(values)];

const requiredSecret = (name, fallback = '') => {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const ENV = NODE_ENV;
export const IS_PRODUCTION = isProduction;
export const PORT = Number(process.env.PORT || 3940);
export const TRUST_PROXY = process.env.TRUST_PROXY
  ? process.env.TRUST_PROXY === 'true'
  : isProduction;

export const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/lupulos_local';

export const JWT_SECRET = requiredSecret('JWT_SECRET');
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '15m';
export const REFRESH_SECRET = requiredSecret(
  'REFRESH_SECRET',
  process.env.JWT_REFRESH_SECRET || ''
);
export const REFRESH_EXPIRATION = process.env.REFRESH_EXPIRATION || '7d';
export const SESSION_SECRET = requiredSecret(
  'SESSION_SECRET',
  process.env.EXPRESS_SESSION_SECRET || process.env.JWT_SECRET || ''
);

const envCorsOrigins = parseCsv(process.env.CORS_ORIGINS);
const mergedCorsOrigins = toUnique([
  ...DEFAULT_CORS_ORIGINS,
  ...envCorsOrigins,
]).filter((origin) => [FRONTEND_URL, 'http://localhost:3000'].includes(origin));

export const CORS_ORIGINS = mergedCorsOrigins;

export const BODY_LIMIT = process.env.BODY_LIMIT || '1mb';
export const URLENCODED_LIMIT = process.env.URLENCODED_LIMIT || '1mb';

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
export const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  `http://localhost:${PORT}/api/auth/google/callback`;

export const MERCADOPAGO_ACCESS_TOKEN =
  process.env.MERCADOPAGO_ACCESS_TOKEN || '';
export const MERCADOPAGO_WEBHOOK_SECRET =
  process.env.MERCADOPAGO_WEBHOOK_SECRET || '';
export const MERCADOPAGO_BACK_URL =
  process.env.MERCADOPAGO_BACK_URL || `${FRONTEND_URL}/planes`;

const config = Object.freeze({
  env: ENV,
  isProduction: IS_PRODUCTION,
  server: {
    port: PORT,
    trustProxy: TRUST_PROXY,
  },
  database: {
    uri: MONGO_URI,
  },
  jwt: {
    accessSecret: JWT_SECRET,
    accessExpiration: JWT_EXPIRATION,
    refreshSecret: REFRESH_SECRET,
    refreshExpiration: REFRESH_EXPIRATION,
  },
  session: {
    secret: SESSION_SECRET,
  },
  cors: {
    origins: CORS_ORIGINS,
  },
  security: {
    bodyLimit: BODY_LIMIT,
    urlEncodedLimit: URLENCODED_LIMIT,
  },
  frontend: {
    url: FRONTEND_URL,
  },
  oauth: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackUrl: GOOGLE_CALLBACK_URL,
    },
  },
  mercadopago: {
    accessToken: MERCADOPAGO_ACCESS_TOKEN,
    webhookSecret: MERCADOPAGO_WEBHOOK_SECRET,
    backUrl: MERCADOPAGO_BACK_URL,
  },
});

export default config;
