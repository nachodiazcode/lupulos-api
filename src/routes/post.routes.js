import express from 'express';
import { createUpload } from '../config/upload.js';

import {
  createPost,
  getAllPosts,
  getPostById,
  getVikingWallFeed,
  deletePost,
  addComment,
  getPostComments,
  updatePost,
  uploadPostImage,
  reactToPost,
} from '../controllers/post.controller.js';

import authMiddleware from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import { postValidation } from '../validations/requestSchemas.js';

const router = express.Router();

const upload = createUpload('posts', {
  limits: {
    fileSize: 250 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      return callback(null, true);
    }
    return callback(new Error('Only image and video files are allowed'));
  },
});

/* Media */
router.post('/upload', authMiddleware, upload.any(), uploadPostImage);
router.post('/muro-vikingo/upload', authMiddleware, upload.any(), uploadPostImage);

/* Posts */
router.get('/muro-vikingo', validateRequest(postValidation.pagination), getVikingWallFeed);
router.post(
  '/muro-vikingo',
  authMiddleware,
  validateRequest(postValidation.createPost),
  createPost
);

router.get('/', validateRequest(postValidation.pagination), getAllPosts);
router.get('/:id', validateRequest(postValidation.postIdParam), getPostById);

router.post(
  '/',
  authMiddleware,
  validateRequest(postValidation.createPost),
  createPost
);

router.put(
  '/:id',
  authMiddleware,
  validateRequest(postValidation.updatePost),
  updatePost
);

router.delete(
  '/:id',
  authMiddleware,
  validateRequest(postValidation.postIdParam),
  deletePost
);

/* Reactions */
router.post(
  '/:id/react',
  authMiddleware,
  validateRequest(postValidation.postReact),
  reactToPost
);

/* Comments */
router.post(
  '/:postId/comments',
  authMiddleware,
  validateRequest(postValidation.postComment),
  addComment
);

router.post(
  '/:postId/comentario',
  authMiddleware,
  validateRequest(postValidation.postComment),
  addComment
);

router.get(
  '/:postId/comments',
  validateRequest(postValidation.postCommentsParams),
  getPostComments
);

router.get(
  '/:postId/comentarios',
  validateRequest(postValidation.postCommentsParams),
  getPostComments
);

export default router;
