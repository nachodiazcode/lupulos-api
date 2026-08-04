import { Router } from 'express';
import {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} from '../controllers/blog.controller.js';
import { authMiddleware } from '../middlewares/index.js';

const router = Router();

// Public routes
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

// Protected routes
router.use(authMiddleware);
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

export default router;
