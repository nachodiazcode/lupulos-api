/**
 * Permission-based access control for Lúpulos App.
 *
 * Architecture:
 *   Permission (atomic)  →  grouped into  →  Role (collection of permissions)
 *   User has one Role + optional customPermissions[]
 *
 * Wildcard support:
 *   'users:*'  matches  'users:read', 'users:delete', etc.
 *   '*'        matches  everything (owner only)
 */

/* ═══════════════════════════════════
   Permission catalogue
═══════════════════════════════════ */

export const PERMISSIONS = Object.freeze({
  // ── Users ──
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_BAN: 'users:ban',
  USERS_CHANGE_ROLE: 'users:change-role',
  USERS_MANAGE_PERMISSIONS: 'users:manage-permissions',

  // ── Beers ──
  BEERS_READ: 'beers:read',
  BEERS_CREATE: 'beers:create',
  BEERS_UPDATE: 'beers:update',
  BEERS_DELETE: 'beers:delete',
  BEERS_FEATURE: 'beers:feature',
  BEERS_REVIEW: 'beers:review',

  // ── Posts ──
  POSTS_READ: 'posts:read',
  POSTS_CREATE: 'posts:create',
  POSTS_UPDATE: 'posts:update',
  POSTS_DELETE: 'posts:delete',
  POSTS_PIN: 'posts:pin',
  POSTS_DELETE_ANY: 'posts:delete-any',

  // ── Places ──
  PLACES_READ: 'places:read',
  PLACES_CREATE: 'places:create',
  PLACES_UPDATE: 'places:update',
  PLACES_DELETE: 'places:delete',
  PLACES_FEATURE: 'places:feature',
  PLACES_DELETE_ANY: 'places:delete-any',

  // ── Comments ──
  COMMENTS_CREATE: 'comments:create',
  COMMENTS_DELETE: 'comments:delete',
  COMMENTS_DELETE_ANY: 'comments:delete-any',

  // ── Chat ──
  CHAT_READ: 'chat:read',
  CHAT_WRITE: 'chat:write',
  CHAT_DELETE_MESSAGES: 'chat:delete-messages',
  CHAT_MUTE_USERS: 'chat:mute-users',

  // ── Subscriptions ──
  SUBSCRIPTIONS_VIEW_OWN: 'subscriptions:view-own',
  SUBSCRIPTIONS_MANAGE: 'subscriptions:manage',
  SUBSCRIPTIONS_GRANT: 'subscriptions:grant',
  SUBSCRIPTIONS_VIEW_ANY: 'subscriptions:view-any',

  // ── Admin ──
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_ANALYTICS: 'admin:analytics',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_LOGS: 'admin:logs',
});

/* ═══════════════════════════════════
   Role → Permission mapping
═══════════════════════════════════ */

export const ROLE_PERMISSIONS = Object.freeze({
  owner: ['*'], // wildcard — all permissions

  admin: [
    'users:*',
    'beers:*',
    'posts:*',
    'places:*',
    'comments:*',
    'chat:*',
    'subscriptions:*',
    'admin:dashboard',
    'admin:analytics',
    'admin:logs',
    // NOTE: admin does NOT have admin:settings — only owner
  ],

  moderator: [
    // Read everything
    'users:read',
    'beers:read',
    'posts:read',
    'places:read',
    // Own content
    'beers:create',
    'beers:update',
    'beers:review',
    'posts:create',
    'posts:update',
    'places:create',
    'places:update',
    'comments:create',
    // Moderation powers
    'users:ban',
    'posts:delete-any',
    'places:delete-any',
    'comments:delete-any',
    'chat:read',
    'chat:write',
    'chat:delete-messages',
    'chat:mute-users',
    // Own subscription
    'subscriptions:view-own',
  ],

  user: [
    // Read
    'users:read',
    'beers:read',
    'posts:read',
    'places:read',
    // Create own content
    'beers:create',
    'beers:update',
    'beers:review',
    'posts:create',
    'posts:update',
    'comments:create',
    'comments:delete',
    // Chat
    'chat:read',
    'chat:write',
    // Subscription
    'subscriptions:view-own',
  ],
});

/* ═══════════════════════════════════
   Role hierarchy (for rank comparison)
═══════════════════════════════════ */

export const ROLE_HIERARCHY = ['user', 'moderator', 'admin', 'owner'];

export const getRoleLevel = (role) => ROLE_HIERARCHY.indexOf(role);

/* ═══════════════════════════════════
   Permission matching engine
═══════════════════════════════════ */

/**
 * Check if a permission pattern matches a target permission.
 *
 * Examples:
 *   matchesPermission('*', 'users:delete')        → true
 *   matchesPermission('users:*', 'users:delete')   → true
 *   matchesPermission('users:read', 'users:delete') → false
 *   matchesPermission('users:read', 'users:read')   → true
 */
const matchesPermission = (pattern, target) => {
  if (pattern === '*') return true;
  if (pattern === target) return true;
  if (pattern.endsWith(':*')) {
    const prefix = pattern.slice(0, -1); // 'users:' from 'users:*'
    return target.startsWith(prefix);
  }
  return false;
};

/**
 * Check if a role has a specific permission.
 */
export const roleHasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.some((p) => matchesPermission(p, permission));
};

/**
 * Check if a set of permission patterns includes a target permission.
 * Used for customPermissions on User.
 */
export const permissionSetHas = (permissionSet, permission) => {
  if (!permissionSet || permissionSet.length === 0) return false;
  return permissionSet.some((p) => matchesPermission(p, permission));
};

/**
 * Check if a user (role + customPermissions) has a specific permission.
 */
export const userHasPermission = (role, customPermissions, permission) => {
  return (
    roleHasPermission(role, permission) ||
    permissionSetHas(customPermissions, permission)
  );
};

/**
 * Get all effective permissions for a role (expanded, no wildcards).
 * Useful for showing the user what they can do.
 */
export const getEffectivePermissions = (role) => {
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  const allPerms = Object.values(PERMISSIONS);

  if (rolePerms.includes('*')) return allPerms;

  return allPerms.filter((perm) =>
    rolePerms.some((pattern) => matchesPermission(pattern, perm))
  );
};

/**
 * List all available permissions (for admin UI).
 */
export const getAllPermissions = () => Object.values(PERMISSIONS);

/**
 * List all roles.
 */
export const getAllRoles = () => Object.keys(ROLE_PERMISSIONS);
