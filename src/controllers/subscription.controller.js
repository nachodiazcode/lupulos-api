import mongoose from 'mongoose';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { PLANS, getPlan, getAvailablePlans } from '../config/plans.js';
import {
  createMPSubscription,
  cancelMPSubscription,
  getMPSubscriptionStatus,
} from '../services/mercadopago.service.js';
import logger from '../utils/logger.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendError, sendSuccess } from '../utils/responseHandler.js';

/* ───────── Helpers ───────── */

const calculateEndDate = (billingCycle) => {
  const now = new Date();
  if (billingCycle === 'yearly') {
    return new Date(now.setFullYear(now.getFullYear() + 1));
  }
  return new Date(now.setMonth(now.getMonth() + 1));
};

const activateSubscription = async (subscription) => {
  subscription.status = 'active';
  subscription.startDate = new Date();
  subscription.endDate = calculateEndDate(subscription.billingCycle);
  await subscription.save();

  await User.findByIdAndUpdate(subscription.user, {
    plan: subscription.plan,
    hasActiveSubscription: true,
    activeSubscription: subscription._id,
  });

  logger.info(
    `Subscription activated: user=${subscription.user} plan=${subscription.plan}`
  );
};

/* ═══════════════════════════════════
   Public endpoints
═══════════════════════════════════ */

/**
 * GET /subscription/plans
 */
export const getPlans = asyncHandler(async (_req, res) => {
  const plans = Object.values(PLANS).map((plan) => ({
    slug: plan.slug,
    name: plan.name,
    prices: plan.prices,
    features: plan.features,
    limits: plan.limits,
  }));

  return sendSuccess(res, {
    message: 'Plans retrieved successfully',
    data: plans,
  });
});

/**
 * GET /subscription/me
 */
export const getMySubscription = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const subscription = await Subscription.findOne({
    user: userId,
    status: 'active',
    endDate: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  const user = await User.findById(userId).select('plan hasActiveSubscription');

  return sendSuccess(res, {
    message: 'Subscription details retrieved successfully',
    data: {
      plan: user.plan,
      hasActiveSubscription: user.hasActiveSubscription,
      subscription: subscription || null,
      planDetails: getPlan(user.plan),
    },
  });
});

/**
 * POST /subscription/subscribe
 * Body: { plan, billingCycle }
 */
export const subscribe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { plan, billingCycle } = req.body;

  if (!plan || !getAvailablePlans().includes(plan)) {
    return sendError(res, {
      statusCode: 400,
      message: `Invalid plan. Available: ${getAvailablePlans().join(', ')}`,
    });
  }

  if (plan === 'free') {
    return sendError(res, {
      statusCode: 400,
      message: 'Cannot subscribe to the free plan. Use /subscription/cancel instead.',
    });
  }

  if (!['monthly', 'yearly'].includes(billingCycle)) {
    return sendError(res, {
      statusCode: 400,
      message: 'billingCycle must be "monthly" or "yearly"',
    });
  }

  const existing = await Subscription.findOne({
    user: userId,
    status: { $in: ['active', 'pending'] },
  });

  if (existing && existing.status === 'active') {
    return sendError(res, {
      statusCode: 409,
      message: `You already have an active "${existing.plan}" subscription. Cancel it first.`,
    });
  }

  if (existing && existing.status === 'pending') {
    await Subscription.findByIdAndDelete(existing._id);
  }

  const user = await User.findById(userId).select('email');
  const planConfig = getPlan(plan);
  const price =
    billingCycle === 'yearly'
      ? planConfig.prices.yearly
      : planConfig.prices.monthly;

  const subscription = await Subscription.create({
    user: userId,
    plan,
    billingCycle,
    status: 'pending',
    endDate: calculateEndDate(billingCycle),
    pricePaid: price,
    currency: planConfig.prices.currency,
    paymentMethod: 'mercadopago',
  });

  let mpResult;
  try {
    mpResult = await createMPSubscription({
      email: user.email,
      planSlug: plan,
      billingCycle,
      externalRef: subscription._id.toString(),
    });
  } catch (mpError) {
    await Subscription.findByIdAndDelete(subscription._id);
    logger.error(`MercadoPago error: ${mpError.message}`);
    return sendError(res, {
      statusCode: 502,
      message: 'Payment gateway error. Please try again later.',
    });
  }

  subscription.mpPreapprovalId = mpResult.id;
  await subscription.save();

  logger.info(
    `Subscription pending: user=${userId} plan=${plan} mp_id=${mpResult.id}`
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Redirect the user to complete payment',
    data: {
      subscriptionId: subscription._id,
      plan: planConfig.name,
      price,
      billingCycle,
      paymentUrl: mpResult.initPoint,
    },
  });
});

/**
 * POST /subscription/cancel
 */
export const cancelSubscription = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const subscription = await Subscription.findOne({
    user: userId,
    status: 'active',
  });

  if (!subscription) {
    return sendError(res, {
      statusCode: 404,
      message: 'No active subscription found',
    });
  }

  if (subscription.mpPreapprovalId) {
    try {
      await cancelMPSubscription(subscription.mpPreapprovalId);
    } catch (mpError) {
      logger.warn(
        `Failed to cancel in MP (id=${subscription.mpPreapprovalId}): ${mpError.message}`
      );
    }
  }

  subscription.status = 'cancelled';
  subscription.cancelledAt = new Date();
  subscription.autoRenew = false;
  await subscription.save();

  logger.info(`Subscription cancelled: user=${userId} plan=${subscription.plan}`);

  return sendSuccess(res, {
    message: `Subscription cancelled. Benefits remain active until ${subscription.endDate.toISOString().split('T')[0]}.`,
    data: subscription,
  });
});

/* ═══════════════════════════════════
   MercadoPago Webhook
═══════════════════════════════════ */

/**
 * POST /subscription/webhook
 */
export const webhook = asyncHandler(async (req, res) => {
  const { type, data } = req.body;

  sendSuccess(res, {
    message: 'Webhook received',
    data: { received: true },
  });

  if (type !== 'subscription_preapproval' || !data?.id) {
    return;
  }

  const mpId = data.id;
  logger.info(`MP webhook received: type=${type} id=${mpId}`);

  let mpSubscription;
  try {
    mpSubscription = await getMPSubscriptionStatus(mpId);
  } catch (error) {
    logger.error(`Failed to verify MP subscription ${mpId}: ${error.message}`);
    return;
  }

  const subscription = await Subscription.findOne({ mpPreapprovalId: mpId });
  if (!subscription) {
    logger.warn(`No local subscription found for MP id: ${mpId}`);
    return;
  }

  switch (mpSubscription.status) {
    case 'authorized':
      if (subscription.status === 'pending') {
        await activateSubscription(subscription);
        logger.info(`Subscription activated via webhook: mp_id=${mpId}`);
      }
      break;

    case 'paused':
      subscription.status = 'past_due';
      await subscription.save();
      logger.info(`Subscription paused: mp_id=${mpId}`);
      break;

    case 'cancelled':
      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      subscription.autoRenew = false;
      await subscription.save();
      logger.info(`Subscription cancelled via MP: mp_id=${mpId}`);
      break;

    default:
      logger.info(`Unhandled MP status: ${mpSubscription.status} for mp_id=${mpId}`);
  }
});

/* ═══════════════════════════════════
   Admin / Owner endpoints
═══════════════════════════════════ */

/**
 * POST /subscription/admin/grant
 * Body: { userId, plan, billingCycle, notes? }
 */
export const adminGrantPlan = asyncHandler(async (req, res) => {
  const { userId, plan, billingCycle = 'monthly', notes } = req.body;
  const grantedBy = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid userId',
    });
  }

  if (!plan || !getAvailablePlans().includes(plan) || plan === 'free') {
    return sendError(res, {
      statusCode: 400,
      message: `Invalid plan. Grantable: ${getAvailablePlans()
        .filter((planSlug) => planSlug !== 'free')
        .join(', ')}`,
    });
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return sendError(res, {
      statusCode: 404,
      message: 'User not found',
    });
  }

  await Subscription.updateMany(
    { user: userId, status: { $in: ['active', 'pending'] } },
    { status: 'expired' }
  );

  const planConfig = getPlan(plan);

  const subscription = await Subscription.create({
    user: userId,
    plan,
    billingCycle,
    status: 'active',
    startDate: new Date(),
    endDate: calculateEndDate(billingCycle),
    pricePaid: 0,
    currency: planConfig.prices.currency,
    paymentMethod: 'gift',
    grantedBy,
    notes: notes || `Gifted by admin ${grantedBy}`,
  });

  await User.findByIdAndUpdate(userId, {
    plan,
    hasActiveSubscription: true,
    activeSubscription: subscription._id,
  });

  logger.info(`Plan gifted: user=${userId} plan=${plan} by=${grantedBy}`);

  return sendSuccess(res, {
    statusCode: 201,
    message: `Plan "${planConfig.name}" granted to ${targetUser.username}`,
    data: subscription,
  });
});

/**
 * GET /subscription/admin/user/:userId
 */
export const adminGetUserSubscriptions = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid userId',
    });
  }

  const subscriptions = await Subscription.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('grantedBy', 'username email');

  const user = await User.findById(userId).select(
    'username email plan hasActiveSubscription'
  );

  return sendSuccess(res, {
    message: 'User subscriptions retrieved successfully',
    data: {
      user,
      subscriptions,
    },
  });
});
