import { Router } from 'express';
import {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} from '../controllers/blog.controller.js';
import { authMiddleware } from '../middlewares/index.js';
import validateRequest from '../middlewares/validateRequest.js';
import { blogValidation, commonValidation } from '../validations/requestSchemas.js';

const router = Router();

// Public routes
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

// Protected routes
router.use(authMiddleware);
router.post('/', validateRequest(blogValidation.createBlog), createBlog);
router.put('/:id', validateRequest(blogValidation.updateBlog), updateBlog);
router.delete('/:id', validateRequest({ params: commonValidation.idParam }), deleteBlog);

export default router;
