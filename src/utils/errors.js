export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const badRequest = (message = 'Bad Request') =>
    new AppError(message, 400);

export const unauthorized = (message = 'Unauthorized') =>
    new AppError(message, 401);

export const forbidden = (message = 'Forbidden') =>
    new AppError(message, 403);

export const notFound = (message = 'Not Found') =>
    new AppError(message, 404);

export const internalError = (message = 'Internal Server Error') =>
    new AppError(message, 500);
