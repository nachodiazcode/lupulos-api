import path from 'path';
import { parseFile } from 'music-metadata';

import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import logger from '../utils/logger.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendError, sendPaginated, sendSuccess } from '../utils/responseHandler.js';

const sortableFields = new Set(['createdAt', 'updatedAt', 'views']);
const reactionTypeMap = {
  cheers: 'cheers',
  like: 'like',
  meGusta: 'like',
  recommended: 'recommended',
  recomendado: 'recommended',
};
const videoExtensions = new Set([
  '.mp4',
  '.mov',
  '.webm',
  '.m4v',
  '.ogg',
  '.ogv',
  '.avi',
  '.mkv',
]);
const imageExtensions = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.avif',
  '.bmp',
  '.svg',
]);
const defaultPostTitle = 'Brindis vikingo';
const defaultMediaContent = 'Compartio una historia en el muro vikingo.';
const maxVideoDurationSeconds = 12 * 60;

const toPlainObject = (value) => {
  if (!value) return null;
  if (typeof value.toJSON === 'function') return value.toJSON();
  return value;
};

const stringId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value.toString === 'function') return value.toString();
  return String(value);
};

const inferMediaType = (value = '') => {
  const normalized = String(value).toLowerCase();

  if (normalized.startsWith('video/')) return 'video';
  if (normalized.startsWith('image/')) return 'image';

  const extension = path.extname(normalized);
  if (videoExtensions.has(extension)) return 'video';
  if (imageExtensions.has(extension)) return 'image';

  return 'image';
};

const normalizeDuration = (durationSeconds) => {
  const parsed = Number(durationSeconds);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed);
};

const buildDerivedTitle = (content = '', hasMedia = false) => {
  const trimmed = String(content).trim();
  if (trimmed) {
    const collapsed = trimmed.replace(/\s+/g, ' ');
    return collapsed.length > 72 ? `${collapsed.slice(0, 69)}...` : collapsed;
  }

  return hasMedia ? defaultPostTitle : 'Nueva historia';
};

const normalizeMediaEntries = (rawMedia = [], fallbackPaths = []) => {
  const queue = [];

  if (Array.isArray(rawMedia)) queue.push(...rawMedia);
  else if (rawMedia) queue.push(rawMedia);

  if (Array.isArray(fallbackPaths)) queue.push(...fallbackPaths);
  else if (fallbackPaths) queue.push(fallbackPaths);

  const normalized = [];
  const seen = new Set();

  for (const entry of queue) {
    if (!entry) continue;

    if (typeof entry === 'string') {
      const cleanPath = entry.trim();
      if (!cleanPath || seen.has(cleanPath)) continue;
      seen.add(cleanPath);
      normalized.push({
        path: cleanPath,
        type: inferMediaType(cleanPath),
        durationSeconds: null,
      });
      continue;
    }

    const rawPath = entry.path || entry.url || entry.src || entry.mediaUrl || '';
    const cleanPath = String(rawPath).trim();
    if (!cleanPath || seen.has(cleanPath)) continue;

    seen.add(cleanPath);
    normalized.push({
      path: cleanPath,
      type: entry.type === 'video' || inferMediaType(entry.type || cleanPath) === 'video'
        ? 'video'
        : 'image',
      durationSeconds: normalizeDuration(entry.durationSeconds),
    });
  }

  return normalized;
};

const ensureReactionShape = (reaction = {}) => {
  const users = Array.isArray(reaction.users) ? reaction.users.map(stringId).filter(Boolean) : [];
  return {
    count: Number.isFinite(reaction.count) ? reaction.count : users.length,
    users,
  };
};

const serializeUser = (user) => {
  const plain = toPlainObject(user);
  if (!plain) return null;

  const id = stringId(plain.id || plain._id);
  const profilePicture =
    plain.profilePicture || plain.fotoPerfil || plain.photo || plain.avatar || '';

  return {
    ...plain,
    id,
    _id: id || plain._id,
    profilePicture,
    fotoPerfil: profilePicture,
    photo: profilePicture,
  };
};

const serializePost = (post) => {
  const plain = toPlainObject(post);
  if (!plain) return null;

  const media = normalizeMediaEntries(plain.media, plain.images);
  const author = serializeUser(plain.author || plain.usuario);
  const likeReaction = ensureReactionShape(plain.reactions?.like);
  const cheersReaction = ensureReactionShape(plain.reactions?.cheers);
  const recommendedReaction = ensureReactionShape(plain.reactions?.recommended);
  const title = plain.title || plain.titulo || buildDerivedTitle(plain.content || plain.contenido, media.length > 0);
  const content =
    plain.content || plain.contenido || (media.length > 0 ? defaultMediaContent : '');
  const id = stringId(plain.id || plain._id);
  const imagePaths = media.map((item) => item.path);

  return {
    ...plain,
    id,
    _id: id || plain._id,
    title,
    titulo: title,
    content,
    contenido: content,
    images: imagePaths,
    imagenes: imagePaths,
    media,
    multimedia: media,
    author,
    usuario: author,
    reactions: {
      cheers: cheersReaction,
      recommended: recommendedReaction,
      like: likeReaction,
    },
    reacciones: {
      brindis: cheersReaction,
      recomendado: recommendedReaction,
      meGusta: {
        count: likeReaction.count,
        usuarios: likeReaction.users,
      },
    },
  };
};

const serializeComment = (comment) => {
  const plain = toPlainObject(comment);
  if (!plain) return null;

  const author = serializeUser(plain.author || plain.usuario);
  const content = plain.content || plain.comentario || '';
  const id = stringId(plain.id || plain._id);

  return {
    ...plain,
    id,
    _id: id || plain._id,
    content,
    comentario: content,
    author,
    usuario: author,
    parentComment: plain.parentComment ? stringId(plain.parentComment) : null,
    likesCount: Array.isArray(plain.likes) ? plain.likes.length : 0,
  };
};

const extractCreatePayload = (body = {}) => {
  const media = normalizeMediaEntries(body.media, [
    ...(Array.isArray(body.images) ? body.images : body.images ? [body.images] : []),
    ...(Array.isArray(body.imagenes) ? body.imagenes : body.imagenes ? [body.imagenes] : []),
  ]);
  const rawContent = body.content ?? body.contenido ?? '';
  const rawTitle = String(body.title ?? body.titulo ?? '').trim();
  const title = rawTitle || buildDerivedTitle(rawContent, media.length > 0);
  const content = String(rawContent).trim() || rawTitle || (media.length > 0 ? defaultMediaContent : defaultPostTitle);

  return {
    title,
    content,
    media,
    images: media.map((item) => item.path),
  };
};

const extractUpdatePayload = (body = {}) => {
  const updates = {};

  if (body.title !== undefined || body.titulo !== undefined) {
    const title = String(body.title ?? body.titulo ?? '').trim();
    if (title) updates.title = title;
  }

  if (body.content !== undefined || body.contenido !== undefined) {
    const content = String(body.content ?? body.contenido ?? '').trim();
    if (content) updates.content = content;
  }

  if (
    body.images !== undefined ||
    body.imagenes !== undefined ||
    body.media !== undefined
  ) {
    const media = normalizeMediaEntries(body.media, [
      ...(Array.isArray(body.images) ? body.images : body.images ? [body.images] : []),
      ...(Array.isArray(body.imagenes) ? body.imagenes : body.imagenes ? [body.imagenes] : []),
    ]);
    updates.media = media;
    updates.images = media.map((item) => item.path);
  }

  return updates;
};

const pickAllUploadedFiles = (req) => {
  if (req.file) return [req.file];
  if (Array.isArray(req.files) && req.files.length > 0) return req.files;

  if (req.files && typeof req.files === 'object') {
    return Object.values(req.files).flat();
  }

  return [];
};

const resolveUploadedFile = async (file) => {
  const mediaType = inferMediaType(file.mimetype || file.originalname || file.filename);
  let durationSeconds = null;

  if (mediaType === 'video') {
    try {
      const metadata = await parseFile(file.path);
      durationSeconds = normalizeDuration(metadata?.format?.duration);
    } catch (error) {
      logger.warn(`Could not parse uploaded video metadata: ${error.message}`);
    }

    if (!durationSeconds) {
      return {
        error: 'No pudimos leer la duración del video. Intenta con otro archivo.',
        statusCode: 400,
      };
    }

    if (durationSeconds > maxVideoDurationSeconds) {
      return {
        error: 'El video supera el máximo permitido de 12 minutos.',
        statusCode: 400,
      };
    }
  }

  return {
    media: {
      path: `/uploads/posts/${file.filename}`,
      type: mediaType,
      durationSeconds,
    },
  };
};

const resolveAllUploadedMedia = async (req) => {
  const files = pickAllUploadedFiles(req);

  if (files.length === 0) {
    return { error: 'No media uploaded', statusCode: 400 };
  }

  const results = [];
  for (const file of files) {
    const result = await resolveUploadedFile(file);
    if (result.error) return result;
    results.push(result.media);
  }

  return { media: results };
};

const fetchPosts = async ({ page, limit, sort, order }) => {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find()
      .populate('author', 'username profilePicture fotoPerfil photo')
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(),
  ]);

  return { posts, total };
};

/* Media */
export const uploadPostImage = asyncHandler(async (req, res) => {
  const { media, error, statusCode } = await resolveAllUploadedMedia(req);

  if (error) {
    return sendError(res, { statusCode, message: error });
  }

  const first = media[0];
  return res.status(201).json({
    success: true,
    message: 'Post media uploaded successfully',
    path: first.path,
    mediaType: first.type,
    durationSeconds: first.durationSeconds,
    data: media,
    media,
  });
});

/* Read */
export const getAllPosts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const sort = sortableFields.has(req.query.sort) ? req.query.sort : 'createdAt';
  const order = req.query.order === 'asc' ? 1 : -1;
  const { posts, total } = await fetchPosts({ page, limit, sort, order });

  return sendPaginated(res, {
    message: 'Posts retrieved successfully',
    data: posts.map(serializePost),
    page,
    limit,
    total,
  });
});

export const getVikingWallFeed = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 18);
  const { posts, total } = await fetchPosts({
    page,
    limit,
    sort: 'createdAt',
    order: -1,
  });

  return sendPaginated(res, {
    message: 'Muro vikingo retrieved successfully',
    data: posts.map(serializePost),
    page,
    limit,
    total,
  });
});

export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    'author',
    'username profilePicture fotoPerfil photo'
  );

  if (!post) {
    return sendError(res, {
      statusCode: 404,
      message: 'Post not found',
    });
  }

  return sendSuccess(res, {
    message: 'Post retrieved successfully',
    data: serializePost(post),
  });
});

/* Create */
export const createPost = asyncHandler(async (req, res) => {
  const payload = extractCreatePayload(req.body);

  const post = await Post.create({
    title: payload.title,
    content: payload.content,
    author: req.user.id,
    images: payload.images,
    media: payload.media,
    reactions: {
      cheers: { count: 0, users: [] },
      recommended: { count: 0, users: [] },
      like: { count: 0, users: [] },
    },
  });

  await post.populate('author', 'username profilePicture fotoPerfil photo');

  logger.info(`Post created by ${req.user.id}`);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Post created successfully',
    data: serializePost(post),
  });
});

/* Update */
export const updatePost = asyncHandler(async (req, res) => {
  const updates = extractUpdatePayload(req.body);

  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, author: req.user.id },
    updates,
    { new: true }
  ).populate('author', 'username profilePicture fotoPerfil photo');

  if (!post) {
    return sendError(res, {
      statusCode: 404,
      message: 'Post not found or forbidden',
    });
  }

  return sendSuccess(res, {
    message: 'Post updated successfully',
    data: serializePost(post),
  });
});

/* Delete */
export const deletePost = asyncHandler(async (req, res) => {
  const deletedPost = await Post.findOneAndDelete({
    _id: req.params.id,
    author: req.user.id,
  });

  if (!deletedPost) {
    return sendError(res, {
      statusCode: 404,
      message: 'Post not found or forbidden',
    });
  }

  return sendSuccess(res, {
    message: 'Post deleted successfully',
    data: {},
  });
});

/* Reactions */
export const reactToPost = asyncHandler(async (req, res) => {
  const rawType = req.body.type;
  const type = reactionTypeMap[rawType] || rawType;
  const userId = req.user.id;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return sendError(res, {
      statusCode: 404,
      message: 'Post not found',
    });
  }

  if (!post.reactions) {
    post.reactions = {};
  }

  if (!post.reactions[type]) {
    post.reactions[type] = { count: 0, users: [] };
  }

  const reaction = post.reactions[type];
  const alreadyReacted = reaction.users.some(
    (id) => id.toString() === userId.toString()
  );

  if (alreadyReacted) {
    reaction.users = reaction.users.filter(
      (id) => id.toString() !== userId.toString()
    );
  } else {
    reaction.users.push(userId);
  }

  reaction.count = reaction.users.length;
  await post.save();

  return sendSuccess(res, {
    message: alreadyReacted
      ? 'Reaction removed successfully'
      : 'Reaction added successfully',
    data: {
      reacted: !alreadyReacted,
      count: reaction.count,
      reactionType: type,
      reactionTypeLegacy: rawType === 'meGusta' ? 'meGusta' : rawType,
      reacciones: {
        meGusta: {
          count: post.reactions.like.count,
          usuarios: post.reactions.like.users.map(stringId),
        },
      },
    },
  });
});

/* Comments */
export const addComment = asyncHandler(async (req, res) => {
  const { content, parentComment } = req.body;
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return sendError(res, {
      statusCode: 404,
      message: 'Post not found',
    });
  }

  // Hilos: validar que el comentario padre exista y pertenezca al mismo post
  let parentId = null;
  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (!parent || String(parent.post) !== String(req.params.postId)) {
      return sendError(res, {
        statusCode: 400,
        message: 'Parent comment not found for this post',
      });
    }
    parentId = parent._id;
  }

  const comment = await Comment.create({
    content,
    author: req.user.id,
    post: req.params.postId,
    parentComment: parentId,
  });

  await comment.populate('author', 'username profilePicture fotoPerfil photo');

  await Post.updateOne(
    { _id: req.params.postId },
    { $addToSet: { comments: comment._id } }
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Comment added successfully',
    data: serializeComment(comment),
  });
});

export const getPostComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .sort({ createdAt: -1 })
    .populate('author', 'username profilePicture fotoPerfil photo');

  return sendSuccess(res, {
    message: 'Post comments retrieved successfully',
    data: comments.map(serializeComment),
  });
});
