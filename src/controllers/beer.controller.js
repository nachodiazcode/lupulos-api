import Beer from '../models/Beer.js';
import logger from '../utils/logger.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendError, sendSuccess } from '../utils/responseHandler.js';

const serializeBeer = (beerDoc) => {
  const beer = beerDoc?.toObject ? beerDoc.toObject() : beerDoc;
  if (!beer) return beer;

  const { style, ...rest } = beer;
  return {
    ...rest,
    beerStyle: style,
  };
};

const normalizeBeerUpdates = (payload = {}) => {
  const updates = {};
  const allowedFields = ['name', 'brewery', 'abv', 'description', 'image', 'video'];

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      updates[field] = payload[field];
    }
  }

  if (payload.beerStyle !== undefined) {
    updates.style = payload.beerStyle;
  }

  return updates;
};

/* ===== Queries ===== */

export const getAllBeers = asyncHandler(async (_req, res) => {
  const beers = await Beer.find()
    .populate('createdBy', 'username profilePicture')
    .populate('reviews.user', 'username profilePicture');

  return sendSuccess(res, {
    message: 'Beers retrieved successfully',
    data: beers.map(serializeBeer),
  });
});

export const getBeerById = asyncHandler(async (req, res) => {
  const beer = await Beer.findById(req.params.id)
    .populate('createdBy', 'username profilePicture')
    .populate('reviews.user', 'username profilePicture')
    .populate('reviews.replies.user', 'username profilePicture');

  if (!beer) {
    return sendError(res, {
      statusCode: 404,
      message: 'Beer not found',
    });
  }

  return sendSuccess(res, {
    message: 'Beer retrieved successfully',
    data: serializeBeer(beer),
  });
});

export const searchBeers = asyncHandler(async (req, res) => {
  const { name, beerStyle, brewery, minAbv, maxAbv } = req.query;
  const filter = {};

  if (name) filter.name = new RegExp(name, 'i');
  if (beerStyle) filter.style = new RegExp(beerStyle, 'i');
  if (brewery) filter.brewery = new RegExp(brewery, 'i');

  if (minAbv !== undefined || maxAbv !== undefined) {
    filter.abv = {};
    if (minAbv !== undefined) filter.abv.$gte = Number(minAbv);
    if (maxAbv !== undefined) filter.abv.$lte = Number(maxAbv);
  }

  const beers = await Beer.find(filter)
    .populate('createdBy', 'username profilePicture')
    .populate('reviews.user', 'username profilePicture');

  return sendSuccess(res, {
    message: 'Beer search completed',
    data: beers.map(serializeBeer),
  });
});

export const getTopRatedBeers = asyncHandler(async (_req, res) => {
  const beers = await Beer.find().sort({ averageRating: -1 }).limit(10);

  return sendSuccess(res, {
    message: 'Top rated beers retrieved successfully',
    data: beers.map(serializeBeer),
  });
});

export const getNewBeers = asyncHandler(async (_req, res) => {
  const beers = await Beer.find().sort({ createdAt: -1 }).limit(10);

  return sendSuccess(res, {
    message: 'Newest beers retrieved successfully',
    data: beers.map(serializeBeer),
  });
});

/* ===== Mutations ===== */

export const createBeer = asyncHandler(async (req, res) => {
  const { name, beerStyle, brewery, abv, description } = req.body;
  const userId = req.user.id;

  const uploadedFiles = req.files?.length ? req.files : req.file ? [req.file] : [];
  const images = uploadedFiles.map((f) => `/uploads/beers/${f.filename}`);
  const image = images[0] ?? req.body.image ?? undefined;

  const beer = await Beer.create({
    name,
    style: beerStyle,
    brewery,
    abv: Number(abv),
    description,
    image,
    images,
    createdBy: userId,
  });

  logger.info(`Beer created: ${beer._id}`);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Beer created successfully',
    data: serializeBeer(beer),
  });
});

export const updateBeer = asyncHandler(async (req, res) => {
  const beer = await Beer.findById(req.params.id);

  if (!beer) {
    return sendError(res, {
      statusCode: 404,
      message: 'Beer not found',
    });
  }

  if (beer.createdBy.toString() !== req.user.id) {
    return sendError(res, {
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const updates = normalizeBeerUpdates(req.body);
  Object.assign(beer, updates);
  await beer.save();

  return sendSuccess(res, {
    message: 'Beer updated successfully',
    data: serializeBeer(beer),
  });
});

export const deleteBeer = asyncHandler(async (req, res) => {
  const beer = await Beer.findById(req.params.id);

  if (!beer) {
    return sendError(res, {
      statusCode: 404,
      message: 'Beer not found',
    });
  }

  if (beer.createdBy.toString() !== req.user.id) {
    return sendError(res, {
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  await beer.deleteOne();

  return sendSuccess(res, {
    message: 'Beer deleted successfully',
    data: {},
  });
});

/* ===== Interactions ===== */

export const toggleLikeBeer = asyncHandler(async (req, res) => {
  const beer = await Beer.findById(req.params.id);
  if (!beer) {
    return sendError(res, {
      statusCode: 404,
      message: 'Beer not found',
    });
  }

  const userId = req.user.id.toString();
  const likeIndex = beer.likes.findIndex((id) => id.toString() === userId);

  if (likeIndex >= 0) {
    beer.likes.splice(likeIndex, 1);
  } else {
    beer.likes.push(req.user.id);
  }

  await beer.save();

  return sendSuccess(res, {
    message: likeIndex >= 0 ? 'Beer unliked successfully' : 'Beer liked successfully',
    data: {
      likes: beer.likes.length,
      liked: likeIndex < 0,
    },
  });
});

export const uploadBeerImages = asyncHandler(async (req, res) => {
  const beer = await Beer.findById(req.params.id);

  if (!beer) {
    return sendError(res, { statusCode: 404, message: 'Beer not found' });
  }

  if (beer.createdBy.toString() !== req.user.id) {
    return sendError(res, { statusCode: 403, message: 'Forbidden' });
  }

  const uploadedFiles = req.files?.length ? req.files : req.file ? [req.file] : [];

  if (!uploadedFiles.length) {
    return sendError(res, { statusCode: 400, message: 'No images uploaded' });
  }

  const newPaths = uploadedFiles.map((f) => `/uploads/beers/${f.filename}`);
  beer.images.push(...newPaths);
  if (!beer.image) beer.image = beer.images[0];
  await beer.save();

  return sendSuccess(res, {
    statusCode: 201,
    message: `${newPaths.length} image(s) uploaded successfully`,
    data: { image: beer.image, images: beer.images },
  });
});

export const deleteBeerImage = asyncHandler(async (req, res) => {
  const beer = await Beer.findById(req.params.id);

  if (!beer) {
    return sendError(res, { statusCode: 404, message: 'Beer not found' });
  }

  if (beer.createdBy.toString() !== req.user.id) {
    return sendError(res, { statusCode: 403, message: 'Forbidden' });
  }

  const idx = parseInt(req.params.index, 10);
  if (isNaN(idx) || idx < 0 || idx >= beer.images.length) {
    return sendError(res, { statusCode: 400, message: 'Invalid image index' });
  }

  beer.images.splice(idx, 1);
  beer.image = beer.images[0] ?? '';
  await beer.save();

  return sendSuccess(res, {
    message: 'Image removed successfully',
    data: { image: beer.image, images: beer.images },
  });
});

export const addBeerReview = asyncHandler(async (req, res) => {
  const { comment, rating, video } = req.body;
  const beer = await Beer.findById(req.params.id);

  if (!beer) {
    return sendError(res, {
      statusCode: 404,
      message: 'Beer not found',
    });
  }

  beer.reviews.push({
    user: req.user.id,
    comment,
    rating: Number(rating),
    video,
  });

  beer.averageRating =
    beer.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
    beer.reviews.length;

  await beer.save();
  await beer.populate('reviews.user', 'username profilePicture');

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Beer review added successfully',
    data: serializeBeer(beer),
  });
});
