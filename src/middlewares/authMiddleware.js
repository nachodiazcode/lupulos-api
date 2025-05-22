// src/middlewares/authMiddleware.js

import jwt from "jsonwebtoken";
import config from "../config/config.js";
import logger from "../utils/logger.js";

// 📌 Middleware principal para autenticar token de acceso
export const authMiddleware = (req, res, next) => {
  try {
    const tokenHeader = req.header("Authorization");

    if (!tokenHeader) {
      logger.warn("❌ No se envió token en la cabecera Authorization");
      return res.status(401).json({ exito: false, mensaje: "Token no proporcionado" });
    }

    const token = tokenHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = {
      id: decoded.id || decoded._id || decoded.userId || null,
      rol: decoded.rol || "user",         // <-- ✅ Aseguramos rol
      provider: decoded.provider || "local", // <-- ✅ Aseguramos proveedor
      ...decoded,
    };

    logger.info(`🔐 Usuario autenticado correctamente: ${req.user.id}`);
    next();
  } catch (error) {
    logger.error(`❌ Error de autenticación: ${error.message}`);
    return res.status(401).json({ exito: false, mensaje: "Token inválido o expirado" });
  }
};

// 📌 Middleware opcional para verificar token sin bloquear acceso
export const verificarToken = (req, res, next) => {
  try {
    const tokenHeader = req.header("Authorization");

    if (!tokenHeader) {
      logger.warn("⚠️ Token no enviado, acceso restringido");
      return res.status(401).json({ exito: false, mensaje: "Acceso denegado, token no proporcionado" });
    }

    const token = tokenHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = {
      id: decoded.id || decoded._id || decoded.userId || null,
      rol: decoded.rol || "user",
      provider: decoded.provider || "local",
      ...decoded,
    };

    logger.info(`🔐 Acceso permitido al usuario: ${req.user.id}`);
    next();
  } catch (error) {
    logger.error(`❌ Acceso denegado por token inválido: ${error.message}`);
    return res.status(403).json({ exito: false, mensaje: "Token inválido o expirado" });
  }
};

// 📌 Middleware: permitir solo a administradores
export const isAdmin = (req, res, next) => {
  if (req.user?.rol === "admin") {
    logger.info(`🛡️ Acceso de administrador autorizado: ${req.user.id}`);
    return next();
  }
  logger.warn(`❌ Acceso denegado: Se requiere rol de administrador`);
  return res.status(403).json({ exito: false, mensaje: "Acceso denegado: Solo administradores" });
};

// 📌 Middleware: permitir solo a usuarios normales
export const isUser = (req, res, next) => {
  if (req.user?.rol === "user") {
    logger.info(`✅ Acceso de usuario autorizado: ${req.user.id}`);
    return next();
  }
  logger.warn(`❌ Acceso denegado: Se requiere rol de usuario`);
  return res.status(403).json({ exito: false, mensaje: "Acceso denegado: Solo usuarios normales" });
};

// 📌 Middleware: permitir solo a usuarios premium
export const isPremium = (req, res, next) => {
  if (req.user?.rol === "premium") {
    logger.info(`🌟 Acceso de usuario premium autorizado: ${req.user.id}`);
    return next();
  }
  logger.warn(`❌ Acceso denegado: Se requiere cuenta Premium`);
  return res.status(403).json({ exito: false, mensaje: "Acceso denegado: Solo usuarios premium" });
};

// 📌 Middleware: permitir acceso solo si login fue por Google
export const authGoogle = (req, res, next) => {
  if (req.user?.provider === "google") {
    logger.info(`🔵 Usuario autenticado con Google: ${req.user.id}`);
    return next();
  }
  logger.warn(`❌ Acceso denegado: Solo autenticación Google permitida`);
  return res.status(403).json({ exito: false, mensaje: "Autenticación de Google requerida" });
};

// 📌 Middleware: permitir acceso solo si login fue por Facebook
export const authFacebook = (req, res, next) => {
  if (req.user?.provider === "facebook") {
    logger.info(`🔵 Usuario autenticado con Facebook: ${req.user.id}`);
    return next();
  }
  logger.warn(`❌ Acceso denegado: Solo autenticación Facebook permitida`);
  return res.status(403).json({ exito: false, mensaje: "Autenticación de Facebook requerida" });
};

export default authMiddleware;
