import User from '../models/User.js';
import { getPlanLevel, planHasFeature, PLAN_HIERARCHY } from '../config/plans.js';

/**
 * Middleware: require a minimum plan tier.
 *
 * Usage:
 *   router.post('/places', authMiddleware, requirePlan('lupuloso'), createPlace);
 *
 * A user with 'pro' passes a 'lupuloso' gate because pro > lupuloso.
 * Admins and owners always pass (they don't need a subscription).
 */
export const requirePlan = (minimumPlan) => async (req, res, next) => {
  try {
    // Admins and owners bypass plan checks
    const role = req.user?.role;
    if (role === 'admin' || role === 'owner') {
      return next();
    }

    const user = await User.findById(req.user.id).select(
      'plan hasActiveSubscription'
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const userLevel = getPlanLevel(user.plan);
    const requiredLevel = getPlanLevel(minimumPlan);

    if (userLevel >= requiredLevel && user.hasActiveSubscription) {
      return next();
    }

    // Free tier passes if minimumPlan is free
    if (minimumPlan === 'free') {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `This feature requires the "${minimumPlan}" plan or higher.`,
      currentPlan: user.plan,
      requiredPlan: minimumPlan,
      upgradePath: '/planes',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: require a specific feature flag.
 *
 * Usage:
 *   router.post('/beers', authMiddleware, requireFeature('beers:create'), createBeer);
 *   router.post('/beers/video', authMiddleware, requireFeature('beers:video'), uploadBeerVideo);
 *
 * Checks the user's current plan against the feature catalogue.
 * Admins and owners always pass.
 */
export const requireFeature = (feature) => async (req, res, next) => {
  try {
    const role = req.user?.role;
    if (role === 'admin' || role === 'owner') {
      return next();
    }

    const user = await User.findById(req.user.id).select(
      'plan hasActiveSubscription'
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Free features are always accessible
    if (planHasFeature('free', feature)) {
      return next();
    }

    // For paid features, user needs an active subscription
    if (user.hasActiveSubscription && planHasFeature(user.plan, feature)) {
      return next();
    }

    // Find which plan unlocks this feature (for the error message)
    const unlockPlan = PLAN_HIERARCHY.find((p) => planHasFeature(p, feature));

    return res.status(403).json({
      success: false,
      message: `Your plan does not include "${feature}".`,
      currentPlan: user.plan,
      requiredPlan: unlockPlan || 'unknown',
      upgradePath: '/planes',
    });
  } catch (error) {
    next(error);
  }
};
