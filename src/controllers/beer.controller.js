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

const parseNaturalLanguageQuery = (query) => {
  const normalized = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (!normalized || normalized.split(/\s+/).length === 1) {
    return null;
  }

  const styles = [];
  let abvFilter = null;

  const lowAbvKeywords = ['suave', 'suaves', 'ligera', 'ligeras', 'ligero', 'ligeros', 'liviana', 'livianas', 'liviano', 'livianos', 'bajo alcohol', 'poco alcohol', 'refrescante', 'refrescantes', 'verano'];
  const highAbvKeywords = ['fuerte', 'fuertes', 'alta graduacion', 'alta graduacion', 'potente', 'potentes', 'intensa', 'intensas', 'intenso', 'intensos', 'mucho alcohol', 'graduacion', 'graduacion', 'invierno', 'calido', 'calidos', 'densa', 'densas', 'denso', 'densos', 'barrica', 'envejecida'];

  const hasLowAbv = lowAbvKeywords.some(kw => normalized.includes(kw));
  const hasHighAbv = highAbvKeywords.some(kw => normalized.includes(kw));

  if (hasLowAbv) {
    abvFilter = { $lt: 5.2 };
  } else if (hasHighAbv) {
    abvFilter = { $gte: 7.0 };
  }

  if (/\b(ipa|hazy|neipa|west coast|lupulad[ao]s?|amarg[ao]s?)\b/i.test(normalized)) {
    styles.push(/(ipa|hazy|pale ale|apa)/i);
  }
  if (/\b(stout|porter|negr[ao]s?|oscur[ao]s?|cacao|chocolate|cafe|tostad[ao]s?)\b/i.test(normalized)) {
    styles.push(/(stout|porter|dark|black|bock)/i);
  }
  if (/\b(sour|acid[ao]s?|frutal(es)?|frut[as]|frambuesa|berries|berliner|gose|lambic)\b/i.test(normalized)) {
    styles.push(/(sour|berliner|gose|lambic|fruit)/i);
  }
  if (/\b(trigo|wheat|hefeweizen|witbier|weissbier|weizen)\b/i.test(normalized)) {
    styles.push(/(wheat|trigo|hefeweizen|witbier|weissbier)/i);
  }
  if (/\b(lager|pilsner|pils|rubi[ao]s?|clasic[ao]s?)\b/i.test(normalized)) {
    styles.push(/(lager|pilsner|golden|pils)/i);
  }
  if (/\b(roja|amber|red|caramelo|cobriz[ao]s?|irish)\b/i.test(normalized)) {
    styles.push(/(red|amber|irish)/i);
  }

  // Remove matching keywords from query so they don't get searched as literal tokens
  let cleanQuery = normalized;
  const wordsToRemove = [
    ...lowAbvKeywords,
    ...highAbvKeywords,
    'ipa', 'hazy', 'neipa', 'west coast', 'lupulada', 'lupulado', 'lupuladas', 'lupulados', 'amarga', 'amargo', 'amargas', 'amargos',
    'stout', 'porter', 'negra', 'negro', 'negras', 'negros', 'oscura', 'oscuro', 'oscuras', 'oscuros', 'cacao', 'chocolate', 'cafe', 'tostada', 'tostado',
    'sour', 'acida', 'ácida', 'acidas', 'ácidas', 'frutal', 'frutales', 'fruta', 'frutas', 'frambuesa', 'berries', 'berliner', 'gose', 'lambic',
    'trigo', 'wheat', 'hefeweizen', 'witbier', 'weissbier', 'weizen',
    'lager', 'pilsner', 'pils', 'rubia', 'rubio', 'clasica', 'clásica',
    'roja', 'amber', 'red', 'caramelo', 'cobrizo', 'irish'
  ];

  for (const word of wordsToRemove) {
    cleanQuery = cleanQuery.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
  }

  const stopwords = new Set([
    'de', 'la', 'el', 'un', 'una', 'con', 'para', 'algo', 'como', 'que',
    'en', 'los', 'las', 'y', 'o', 'pero', 'no', 'tan', 'muy', 'una', 'del',
    'cerveza', 'cervezas', 'recomiendame', 'recomienda', 'busca', 'busco'
  ]);

  const tokens = cleanQuery
    .split(/[\s,./?¿!¡]+/)
    .filter(t => t.length > 2 && !stopwords.has(t));

  const queryConditions = [];

  if (abvFilter) {
    queryConditions.push({ abv: abvFilter });
  }

  if (styles.length > 0) {
    queryConditions.push({
      $or: styles.map(styleRegex => ({ style: styleRegex }))
    });
  }

  if (tokens.length > 0) {
    const tokenOrConditions = tokens.map(token => {
      const regex = new RegExp(token, 'i');
      return {
        $or: [
          { name: regex },
          { brewery: regex },
          { style: regex },
          { description: regex }
        ]
      };
    });
    queryConditions.push({ $and: tokenOrConditions });
  }

  if (queryConditions.length > 0) {
    return { $and: queryConditions };
  }

  return null;
};

export const searchBeers = asyncHandler(async (req, res) => {
  const { name, beerStyle, brewery, minAbv, maxAbv } = req.query;
  let filter = {};

  if (name) {
    const nlFilter = parseNaturalLanguageQuery(name);
    if (nlFilter) {
      filter = nlFilter;
    } else {
      filter.name = new RegExp(name, 'i');
    }
  }

  if (beerStyle) filter.style = new RegExp(beerStyle, 'i');
  if (brewery) filter.brewery = new RegExp(brewery, 'i');

  if (minAbv !== undefined || maxAbv !== undefined) {
    filter.abv = {};
    if (minAbv !== undefined) filter.abv.$gte = Number(minAbv);
    if (maxAbv !== undefined) filter.abv.$lte = Number(maxAbv);
  }

  let beers = await Beer.find(filter)
    .populate('createdBy', 'username profilePicture')
    .populate('reviews.user', 'username profilePicture');

  if (name && beers.length === 0) {
    const tokens = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .split(/[\s,./?¿!¡]+/)
      .filter(t => t.length > 2);

    if (tokens.length > 0) {
      const fallbackFilter = {
        $or: tokens.map(t => {
          const regex = new RegExp(t, 'i');
          return {
            $or: [
              { name: regex },
              { style: regex },
              { brewery: regex },
              { description: regex }
            ]
          };
        })
      };
      beers = await Beer.find(fallbackFilter)
        .populate('createdBy', 'username profilePicture')
        .populate('reviews.user', 'username profilePicture');
    }
  }

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
