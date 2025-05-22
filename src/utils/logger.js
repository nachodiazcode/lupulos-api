import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import chalk from 'chalk';

// 🎨 Formato personalizado con colores para consola
const customFormat = winston.format.printf(({ timestamp, level, message }) => {
  const color = {
    info: chalk.blueBright,
    warn: chalk.yellowBright,
    error: chalk.redBright,
    debug: chalk.magentaBright,
  }[level] || ((text) => text);

  return `${chalk.gray(timestamp)} ${color(`[${level.toUpperCase()}]`)}: ${chalk.white(message)}`;
});

// 🎯 Logger principal
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.simple()
  ),
  transports: [
    // 📁 Archivo rotativo
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
    }),

    // ⚙️ Archivo de errores separados
    new winston.transports.File({
      filename: 'logs/errors.log',
      level: 'error',
    }),
  ],
});

// 🖥️ Mostrar en consola (solo si no estamos en producción)
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        customFormat
      ),
    })
  );
}

// 🛡️ Captura errores no manejados
process.on('unhandledRejection', (err) => {
  logger.error(`🚨 Unhandled Rejection: ${err.message}\n${err.stack}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`🔥 Uncaught Exception: ${err.message}\n${err.stack}`);
});

export default logger;
