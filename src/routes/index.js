import authRoutes from './auth.routes.js';
import express from 'express';
import userRoutes from './user.routes.js';
import followRoutes from './follow.routes.js';
import postRoutes from './post.routes.js';
import beerRoutes from './beer.routes.js';
import chatRoutes from './chat.routes.js';
import placeRoutes from './places.routes.js';
import subscriptionRoutes from './subscription.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/follow', followRoutes);
router.use('/post', postRoutes);
router.use('/beer', beerRoutes);
router.use('/chat', chatRoutes);
router.use('/places', placeRoutes);
router.use('/location', placeRoutes); // backward compatibility with existing clients
router.use('/subscription', subscriptionRoutes);

export default router;
