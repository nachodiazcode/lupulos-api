import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import chalk from 'chalk';

/**
 * Custom console formatter with colorized output.
 * Used only for local development.
 */
const consoleFormat = winston.format.printf(({ timestamp, level, message }) => {
  const colorMap = {
    info: chalk.blueBright,
    warn: chalk.yellowBright,
    error: chalk.redBright,
    debug: chalk.magentaBright,
  };

  const colorize = colorMap[level] || ((text) => text);

  return `${chalk.gray(timestamp)} ${colorize(`[${level.toUpperCase()}]`)}: ${chalk.white(message)}`;
});

/**
 * Main logger instance.
 * Writes structured logs to files and
 * colorized logs to console in non-production environments.
 */
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.simple()
  ),
  transports: [
    // Daily rotated application logs
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
    }),

    // Dedicated error log file
    new winston.transports.File({
      filename: 'logs/errors.log',
      level: 'error',
    }),
  ],
});

/**
 * Console output enabled only outside production.
 */
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        consoleFormat
      ),
    })
  );
}

/**
 * Global process-level error handlers.
 * Ensures unexpected failures are always logged.
 */
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Promise Rejection', error);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
});

export default logger;
