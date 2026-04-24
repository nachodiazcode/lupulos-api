import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendError, sendSuccess } from '../utils/responseHandler.js';

/**
 * Get user followers
 */
export const getFollowers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate(
    'followers',
    'username email profilePicture'
  );

  if (!user) {
    return sendError(res, {
      statusCode: 404,
      message: 'User not found',
    });
  }

  return sendSuccess(res, {
    message: 'Followers retrieved successfully',
    data: user.followers,
  });
});

/**
 * Get users the user is following
 */
export const getFollowing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate(
    'following',
    'username email profilePicture'
  );

  if (!user) {
    return sendError(res, {
      statusCode: 404,
      message: 'User not found',
    });
  }

  return sendSuccess(res, {
    message: 'Following users retrieved successfully',
    data: user.following,
  });
});

/**
 * Follow user
 */
export const followUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const targetId = req.params.id;

  if (userId === targetId) {
    return sendError(res, {
      statusCode: 400,
      message: 'You cannot follow yourself',
    });
  }

  const targetExists = await User.exists({ _id: targetId });
  if (!targetExists) {
    return sendError(res, {
      statusCode: 404,
      message: 'User not found',
    });
  }

  await Promise.all([
    User.updateOne(
      { _id: userId },
      { $addToSet: { following: targetId } }
    ),
    User.updateOne(
      { _id: targetId },
      { $addToSet: { followers: userId } }
    ),
  ]);

  return sendSuccess(res, {
    message: 'User followed successfully',
    data: {},
  });
});

/**
 * Unfollow user
 */
export const unfollowUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const targetId = req.params.id;

  await Promise.all([
    User.updateOne(
      { _id: userId },
      { $pull: { following: targetId } }
    ),
    User.updateOne(
      { _id: targetId },
      { $pull: { followers: userId } }
    ),
  ]);

  return sendSuccess(res, {
    message: 'User unfollowed successfully',
    data: {},
  });
});
