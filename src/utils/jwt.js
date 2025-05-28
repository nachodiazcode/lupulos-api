import jwt from "jsonwebtoken";
import config from "../config/config.js";

// 🔐 Generar Access Token
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    config.jwtSecret,
    { expiresIn: config.tokenExpiration } // Ej: 15m
  );
};

// 🔁 Generar Refresh Token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    config.jwtRefreshSecret,
    { expiresIn: config.refreshTokenExpiration } // Ej: 30d
  );
};

// ✅ Verificar Access Token
export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

// ✅ Verificar Refresh Token
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwtRefreshSecret);
};
