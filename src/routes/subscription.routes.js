import express from 'express';
import { authMiddleware, isAdmin } from '../middlewares/index.js';
import validateRequest from '../middlewares/validateRequest.js';
import { subscriptionValidation, commonValidation } from '../validations/requestSchemas.js';
import {
  getPlans,
  getMySubscription,
  subscribe,
  cancelSubscription,
  webhook,
  adminGrantPlan,
  adminGetUserSubscriptions,
} from '../controllers/subscription.controller.js';

const router = express.Router();

// ─── Public ───
router.get('/plans', getPlans);

// ─── MercadoPago Webhook (no auth — validated by MP verification) ───
router.post('/webhook', webhook);

// ─── Authenticated ───
router.get('/me', authMiddleware, getMySubscription);
router.post(
  '/subscribe',
  authMiddleware,
  validateRequest(subscriptionValidation.subscribe),
  subscribe
);
router.post('/cancel', authMiddleware, cancelSubscription);

// ─── Admin / Owner ───
router.post(
  '/admin/grant',
  authMiddleware,
  isAdmin,
  validateRequest(subscriptionValidation.adminGrant),
  adminGrantPlan
);

router.get(
  '/admin/user/:userId',
  authMiddleware,
  isAdmin,
  validateRequest({ params: commonValidation.userIdParam }),
  adminGetUserSubscriptions
);

export default router;
