import logger from '../utils/logger.js';
import config from '../config/index.js';
import { sendError } from '../utils/responseHandler.js';

/**
 * Global application error handler.
 *
 * Operational errors (AppError, isOperational=true) carry messages that are
 * safe to show to clients. Unexpected errors (bugs, driver errors) are
 * always logged in full but only expose their raw message outside production,
 * so internals (stack traces, Mongo error text, etc.) never leak to callers.
 */
const errorHandler = (err, req, res, _next) => {
  logger.error(err.message, { stack: err.stack });

  const statusCode = err.statusCode || err.status || 500;
  const safeToExpose = err.isOperational || !config.isProduction;

  return sendError(res, {
    statusCode,
    message: safeToExpose ? err.message : 'Internal server error',
    errors: safeToExpose ? err.errors || [] : [],
  });
};

export default errorHandler;
