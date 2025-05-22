import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import config from './config.js'; // Asegúrate de que config.js use "export default"

export async function connectDB() {
    try {
        await mongoose.connect(config.mongoURI); // ❌ Elimina `useNewUrlParser` y `useUnifiedTopology`
        logger.info('✅ Conectado a MongoDB correctamente');
    } catch (error) {
        logger.error(`❌ Error conectando a MongoDB: ${error.message}`);
        process.exit(1);
    }
}
