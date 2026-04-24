import logger from '../utils/logger.js';
import { sendError } from '../utils/responseHandler.js';

/**
 * Global application error handler.
 */
const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  return sendError(res, {
    statusCode: err.statusCode || err.status || 500,
    message: err.message || 'Internal server error',
    errors: err.errors || [],
  });
};

export default errorHandler;
