import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import config from './config.js';

export async function connectDB() {
    if (!config.mongoURI) {
        logger.error('❌ No se ha definido la URI de MongoDB en config.js');
        process.exit(1);
    }

    try {
        await mongoose.connect(config.mongoURI);
        logger.info(`✅ MongoDB conectado: ${mongoose.connection.host}`);
    } catch (error) {
        logger.error(`❌ Error al conectar a MongoDB: ${error.message}`);
        process.exit(1);
    }

    // Eventos de conexión
    mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️ Conexión a MongoDB perdida');
    });

    mongoose.connection.on('connected', () => {
        logger.info('🔄 MongoDB reconectado');
    });

    mongoose.connection.on('error', (err) => {
        logger.error(`❌ Error en la conexión a MongoDB: ${err}`);
    });
}
