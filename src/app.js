import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import path from 'path';

import logger from './utils/logger.js';
import config from './config/index.js';
import { connectDB } from './config/db.js';
import { setupSwagger } from './config/swagger.js';
import { initRealtime } from './config/realtime.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

import './config/passport.js';

const app = express();

// DB
await connectDB();

// Middlewares
app.set('trust proxy', config.server.trustProxy ? 1 : 0);

const allowedOrigins = config.cors.origins || [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl/postman/mobile native
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(
  helmet({
    // El frontend corre en otro origen durante desarrollo (3000 vs 3940),
    // así que los assets públicos de /uploads deben poder renderizarse cross-origin.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(express.json({ limit: config.security.bodyLimit }));
app.use(
  express.urlencoded({
    extended: true,
    limit: config.security.urlEncodedLimit,
    parameterLimit: 1000,
  })
);

app.use(
  session({
    name: 'lupulos.sid',
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.isProduction,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Healthcheck
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'lupulos-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Swagger
setupSwagger(app);

// Routes
app.use('/api', routes);

// Global error handler
app.use(errorHandler);

// Server
// Server
import https from 'https';
import fs from 'fs';

const PORT = config.server.port;
let server;
const forceHttps = process.env.FORCE_HTTPS === 'true';
const forceHttp = process.env.FORCE_HTTP === 'true';

const sslOptions = {
  key: fs.existsSync('./certs/key.pem') ? fs.readFileSync('./certs/key.pem') : null,
  cert: fs.existsSync('./certs/cert.pem') ? fs.readFileSync('./certs/cert.pem') : null,
};

if (!forceHttp && (config.isProduction || forceHttps) && sslOptions.key && sslOptions.cert) {
  server = https.createServer(sslOptions, app).listen(PORT, () => {
    logger.info(`API running on port ${PORT} (HTTPS)`);
  });
} else {
  server = app.listen(PORT, () => {
    logger.info(`API running on port ${PORT} (HTTP)`);
  });
}

// Realtime (socket.io) — live chat messages over the same server
initRealtime(server);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down server...');
  server.close(() => {
    logger.info('Server closed gracefully');
    process.exit(0);
  });
});
