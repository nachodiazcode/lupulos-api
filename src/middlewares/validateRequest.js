import { sendError } from '../utils/responseHandler.js';

const defaultOptions = {
  abortEarly: false,
  stripUnknown: true,
  convert: true,
};

const getValidationConfig = (segment) =>
  segment === 'query'
    ? { ...defaultOptions, allowUnknown: true }
    : defaultOptions;

export const validateRequest = (schema = {}) => (req, res, next) => {
  try {
    const segments = ['params', 'query', 'body'];

    for (const segment of segments) {
      if (!schema[segment]) continue;

      const { error, value } = schema[segment].validate(
        req[segment],
        getValidationConfig(segment)
      );

      if (error) {
        return sendError(res, {
          statusCode: 400,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
      }

      req[segment] = value;
    }

    return next();
  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      message: 'Validation middleware failed',
      errors: [error.message],
    });
  }
};

export default validateRequest;
