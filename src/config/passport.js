import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import config from './index.js';

/**
 * Google OAuth 2.0 strategy.
 * Responsible only for authentication logic.
 */
if (config.oauth.google.clientId && config.oauth.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.oauth.google.clientId,
        clientSecret: config.oauth.google.clientSecret,
        callbackURL: config.oauth.google.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();

          if (!email) {
            return done(new Error('Google profile does not provide an email'));
          }

          let user = await User.findOne({ email });

          if (!user) {
            // Generate a unique username based on displayName
            let baseUsername = profile.displayName || email.split('@')[0];
            let username = baseUsername;
            let suffix = 1;
            while (await User.findOne({ username })) {
              username = `${baseUsername}${suffix}`;
              suffix++;
            }

            user = await User.create({
              username,
              email,
              provider: 'google',
              profilePicture: profile.photos?.[0]?.value,
              password: await bcrypt.hash(
                `${profile.id}-${Date.now()}`,
                10
              ),
            });
          } else {
            // Update existing user: link Google provider and refresh profile picture
            const updates = {};
            if (user.provider === 'local') updates.provider = 'google';
            if (profile.photos?.[0]?.value && !user.profilePicture?.startsWith('/uploads')) {
              updates.profilePicture = profile.photos[0].value;
            }
            if (Object.keys(updates).length > 0) {
              Object.assign(user, updates);
              await user.save();
            }
          }

          return done(null, user);
        } catch (error) {
          console.error('Google OAuth strategy error:', error);
          return done(error);
        }
      }
    )
  );
} else {
  console.warn('Google OAuth credentials not provided. Google Strategy skipped.');
}

/**
 * Serialize user ID into the session.
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserialize user from session.
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
