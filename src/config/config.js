import dotenv from 'dotenv';

dotenv.config(); // 🔹 Cargar variables de entorno

const config = {  // 🔹 Definir la constante antes de exportarla
    port: process.env.PORT || 3940,
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/lupulos',
    jwtSecret: process.env.JWT_SECRET || 'supersecreto',
    logLevel: process.env.LOG_LEVEL || 'info',
    tokenExpiration: process.env.TOKEN_EXPIRATION || '30d',

};

export default config; // 🔹 Exportación por defecto
