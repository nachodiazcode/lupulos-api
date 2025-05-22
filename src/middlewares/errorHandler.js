// src/middlewares/errorHandler.js

import logger from "../utils/logger.js";

// 📌 Middleware general para manejar errores de la app
const errorHandler = (err, req, res, next) => {
  logger.error(`❌ Error capturado: ${err.message}`);

  res.status(err.statusCode || 500).json({
    exito: false,
    mensaje: err.message || "Error interno del servidor"
  });
};

export default errorHandler;
