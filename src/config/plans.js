/**
 * Plan definitions for Lúpulos App.
 *
 * Each plan declares:
 *   - slug         → stored in User.plan & Subscription.plan
 *   - display name → human-readable label
 *   - prices       → monthly & yearly in CLP
 *   - features     → set of feature flags the plan unlocks
 *   - limits       → numeric caps (0 = unlimited)
 *
 * To gate a feature, use the `requireFeature('feature:name')` middleware.
 * To gate by minimum plan tier, use `requirePlan('lupuloso')`.
 */

/* ───────── Feature catalogue ───────── */
export const FEATURES = Object.freeze({
  // Beers
  BEERS_CREATE: 'beers:create',
  BEERS_UNLIMITED: 'beers:unlimited',
  BEERS_VIDEO: 'beers:video',

  // Posts
  POSTS_CREATE: 'posts:create',
  POSTS_PIN: 'posts:pin',
  POSTS_ANALYTICS: 'posts:analytics',

  // Places
  PLACES_CREATE: 'places:create',
  PLACES_UNLIMITED: 'places:unlimited',

  // Profile
  PROFILE_CUSTOM: 'profile:custom',
  PROFILE_BADGE: 'profile:badge',
  PROFILE_HIGHLIGHTED: 'profile:highlighted',

  // Chat
  CHAT_READ: 'chat:read',
  CHAT_WRITE: 'chat:write',

  // Community
  COMMENTS_HIGHLIGHTED: 'comments:highlighted',

  // Premium content
  CONTENT_PREMIUM: 'content:premium',
  BETA_ACCESS: 'beta:access',
  EVENTS_EXCLUSIVE: 'events:exclusive',
  FEEDBACK_TEAM: 'feedback:team',
});

/* ───────── Plan hierarchy (index = tier level) ───────── */
export const PLAN_HIERARCHY = ['free', 'lupuloso', 'pro', 'explorer'];

/* ───────── Plan definitions ───────── */
export const PLANS = Object.freeze({
  free: {
    slug: 'free',
    name: 'Gratis',
    prices: { monthly: 0, yearly: 0, currency: 'CLP' },
    features: [
      FEATURES.BEERS_CREATE,
      FEATURES.POSTS_CREATE,
      FEATURES.CHAT_READ,
      FEATURES.CHAT_WRITE,
    ],
    limits: {
      beersPerMonth: 5,
      postsPerMonth: 10,
      placesPerMonth: 0, // cannot create places
    },
  },

  lupuloso: {
    slug: 'lupuloso',
    name: 'Lupuloso',
    prices: { monthly: 2000, yearly: 20000, currency: 'CLP' },
    features: [
      FEATURES.BEERS_CREATE,
      FEATURES.POSTS_CREATE,
      FEATURES.PLACES_CREATE,
      FEATURES.PROFILE_CUSTOM,
      FEATURES.COMMENTS_HIGHLIGHTED,
      FEATURES.CHAT_READ,
      FEATURES.CHAT_WRITE,
    ],
    limits: {
      beersPerMonth: 20,
      postsPerMonth: 50,
      placesPerMonth: 5,
    },
  },

  pro: {
    slug: 'pro',
    name: 'Cervecero Pro',
    prices: { monthly: 6000, yearly: 60000, currency: 'CLP' },
    features: [
      FEATURES.BEERS_CREATE,
      FEATURES.BEERS_UNLIMITED,
      FEATURES.BEERS_VIDEO,
      FEATURES.POSTS_CREATE,
      FEATURES.POSTS_PIN,
      FEATURES.POSTS_ANALYTICS,
      FEATURES.PLACES_CREATE,
      FEATURES.PLACES_UNLIMITED,
      FEATURES.PROFILE_CUSTOM,
      FEATURES.PROFILE_BADGE,
      FEATURES.PROFILE_HIGHLIGHTED,
      FEATURES.COMMENTS_HIGHLIGHTED,
      FEATURES.CONTENT_PREMIUM,
      FEATURES.CHAT_READ,
      FEATURES.CHAT_WRITE,
    ],
    limits: {
      beersPerMonth: 0, // unlimited
      postsPerMonth: 0,
      placesPerMonth: 0,
    },
  },

  explorer: {
    slug: 'explorer',
    name: 'Explorador',
    prices: { monthly: 9000, yearly: 85000, currency: 'CLP' },
    features: [
      // Everything in pro +
      FEATURES.BEERS_CREATE,
      FEATURES.BEERS_UNLIMITED,
      FEATURES.BEERS_VIDEO,
      FEATURES.POSTS_CREATE,
      FEATURES.POSTS_PIN,
      FEATURES.POSTS_ANALYTICS,
      FEATURES.PLACES_CREATE,
      FEATURES.PLACES_UNLIMITED,
      FEATURES.PROFILE_CUSTOM,
      FEATURES.PROFILE_BADGE,
      FEATURES.PROFILE_HIGHLIGHTED,
      FEATURES.COMMENTS_HIGHLIGHTED,
      FEATURES.CONTENT_PREMIUM,
      FEATURES.CHAT_READ,
      FEATURES.CHAT_WRITE,
      // Explorer exclusives
      FEATURES.BETA_ACCESS,
      FEATURES.EVENTS_EXCLUSIVE,
      FEATURES.FEEDBACK_TEAM,
    ],
    limits: {
      beersPerMonth: 0,
      postsPerMonth: 0,
      placesPerMonth: 0,
    },
  },
});

/* ───────── Helpers ───────── */

/** Get plan config by slug */
export const getPlan = (slug) => PLANS[slug] || PLANS.free;

/** Get the tier level of a plan (higher = better) */
export const getPlanLevel = (slug) => PLAN_HIERARCHY.indexOf(slug);

/** Check if a plan has a specific feature */
export const planHasFeature = (planSlug, feature) =>
  getPlan(planSlug).features.includes(feature);

/** Get the numeric limit for a plan (0 = unlimited) */
export const getPlanLimit = (planSlug, limitKey) =>
  getPlan(planSlug).limits?.[limitKey] ?? 0;

/** List all available plan slugs */
export const getAvailablePlans = () => Object.keys(PLANS);
