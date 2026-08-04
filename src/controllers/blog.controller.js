import Blog from '../models/Blog.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../utils/responseHandler.js';
import { notFound, badRequest } from '../utils/errors.js';

export const createBlog = asyncHandler(async (req, res) => {
  const { title, content, coverImage, tags, status } = req.body;
  const author = req.user.id;

  const newBlog = new Blog({
    title,
    content,
    author,
    coverImage,
    tags,
    status,
    publishedAt: status === 'published' ? new Date() : undefined,
  });

  await newBlog.save();

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Blog created successfully',
    data: newBlog,
  });
});

export const getBlogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Filter out drafts unless specified by an admin/author (for now, only published)
  const filter = { status: 'published' };

  if (req.query.author) {
    filter.author = req.query.author;
  }

  const blogs = await Blog.find(filter)
    .populate('author', 'name profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Blog.countDocuments(filter);

  return sendPaginated(res, {
    statusCode: 200,
    message: 'Blogs retrieved successfully',
    data: blogs,
    page,
    limit,
    total,
  });
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const blog = await Blog.findOne({ slug }).populate('author', 'name profilePicture');

  if (!blog) {
    throw notFound('Blog not found');
  }

  // Increment views
  blog.views += 1;
  await blog.save();

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Blog retrieved successfully',
    data: blog,
  });
});

export const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const blog = await Blog.findById(id);

  if (!blog) {
    throw notFound('Blog not found');
  }

  if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
    throw badRequest('Not authorized to update this blog');
  }

  if (updates.status === 'published' && blog.status !== 'published') {
    updates.publishedAt = new Date();
  }

  Object.assign(blog, updates);
  await blog.save();

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Blog updated successfully',
    data: blog,
  });
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    throw notFound('Blog not found');
  }

  if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
    throw badRequest('Not authorized to delete this blog');
  }

  await blog.deleteOne();

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Blog deleted successfully',
  });
});
