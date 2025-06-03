import winston from "winston";
import chalk from "chalk";

// Definir colores para cada nivel de log
const logColors = {
    error: chalk.red.bold,
    warn: chalk.yellow.bold,
    info: chalk.blue,
    debug: chalk.magenta,
    success: chalk.green.bold,
    route: chalk.cyan.bold
};

// Crear logger con formato mejorado
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => {
            const color = logColors[level] || chalk.white;
            return color(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
        })
    ),
    transports: [
        new winston.transports.Console(), // Mostrar en consola
        new winston.transports.File({ filename: "logs/server.log" }) // Guardar en archivo
    ],
});

// Métodos personalizados para cada tipo de log
logger.success = (message) => logger.info(logColors.success(message));
logger.error = (message) => logger.log("error", message);
logger.warning = (message) => logger.log("warn", message);
logger.info = (message) => logger.log("info", message);
logger.route = (method, path) => logger.info(logColors.route(`📍 [${method}] ${path}`));

export default logger;
