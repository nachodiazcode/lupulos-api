import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import followRoutes from './followRoutes.js'; // ✅ importante
import postRoutes from './postRoutes.js';
import beerRoutes from './beerRoutes.js';
import chatRoutes from './chatRoutes.js';
import locationRoutes from './locationRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/follow', followRoutes); // ✅ aquí se monta bien
router.use('/post', postRoutes);
router.use('/beer', beerRoutes);
router.use('/chat', chatRoutes);
router.use('/location', locationRoutes);

export default router;

