import jwt from "jsonwebtoken";

export const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "secreto_super_seguro",
    { expiresIn: process.env.JWT_EXPIRATION || "15m" } // Ej: 15 minutos
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.REFRESH_SECRET || "secreto_refresh",
    { expiresIn: process.env.REFRESH_EXPIRATION || "7d" } // Ej: 7 días
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || "secreto_super_seguro");
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_SECRET || "secreto_refresh");
};
