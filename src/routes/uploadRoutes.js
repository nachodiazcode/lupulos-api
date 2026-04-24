import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getPostComments,
  updatePost,
  uploadPostImage,
  contarVisita,
} from '../controllers/post.controller.js';

import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

/* Resolve __dirname in ESM */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Upload directory */
const uploadsPath = path.join(__dirname, '../uploads/posts');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

/* Multer config */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsPath),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

/* Media */
router.post(
  '/upload',
  authMiddleware,
  upload.single('imagen'),
  uploadPostImage
);

/* Posts */
router.get('/', getAllPosts);
router.get('/:id', getPostById);

router.post('/', authMiddleware, createPost);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);

/* Likes */
router.post('/:id/like', authMiddleware, likePost);
router.post('/:id/unlike', authMiddleware, unlikePost);

/* Comments */
router.post('/:postId/comentario', authMiddleware, addComment);
router.get('/:postId/comentarios', getPostComments);

/* Visits */
router.post('/:postId/visita', authMiddleware, contarVisita);

export default router;
