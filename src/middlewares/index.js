// src/middlewares/index.js

export { default as authMiddleware, verificarToken, isAdmin, isUser, isPremium, authGoogle, authFacebook } from "./authMiddleware.js";
export { default as errorHandler } from "./errorHandler.js";
