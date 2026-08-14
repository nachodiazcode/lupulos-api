import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import config from './index.js';

mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error', error);
});

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
});

export const connectDB = async () => {
    try {
        if (!config.database.uri) {
            throw new Error('Database URI is not defined');
        }

        await mongoose.connect(config.database.uri);

        logger.info('Connected to MongoDB successfully');
    } catch (error) {
        logger.error('Error connecting to MongoDB', error);
        process.exit(1);
    }
};
