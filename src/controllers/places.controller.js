import Place from '../models/Place.js';
import logger from '../utils/logger.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendError, sendSuccess } from '../utils/responseHandler.js';

const parseAddress = (address) => {
  if (typeof address === 'string') {
    return JSON.parse(address);
  }
  return address;
};

/* Create */
const parseCoordinates = (coordinates) => {
  if (!coordinates) return undefined;
  if (typeof coordinates === 'string') {
    const parsed = JSON.parse(coordinates);
    return { lat: Number(parsed.lat), lng: Number(parsed.lng) };
  }
  return { lat: Number(coordinates.lat), lng: Number(coordinates.lng) };
};

export const createPlace = asyncHandler(async (req, res) => {
  const { name, description, address, coordinates } = req.body;
  const ownerId = req.user?.id;
  const uploadedFiles = req.files?.length ? req.files : req.file ? [req.file] : [];

  if (!ownerId) {
    return sendError(res, {
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  let parsedAddress;
  try {
    parsedAddress = parseAddress(address);
  } catch (_error) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid address format',
    });
  }

  let parsedCoordinates;
  try {
    parsedCoordinates = parseCoordinates(coordinates);
  } catch (_error) {
    /* coordinates are optional – ignore parse errors */
  }

  const gallery = uploadedFiles.map((f) => `/uploads/places/${f.filename}`);
  const coverImage = gallery[0];

  const place = await Place.create({
    name,
    description,
    address: parsedAddress,
    ...(parsedCoordinates && { coordinates: parsedCoordinates }),
    ...(coverImage && { coverImage }),
    ...(gallery.length && { gallery }),
    owner: ownerId,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Place created successfully',
    data: place,
  });
});

export const createMultiplePlaces = asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body) || req.body.length === 0) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid places array',
    });
  }

  const ownerId = req.user?.id;
  if (!ownerId) {
    return sendError(res, {
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const normalizedPlaces = req.body.map((place) => ({
    ...place,
    owner: ownerId,
  }));

  const places = await Place.insertMany(normalizedPlaces);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Places created successfully',
    data: places,
  });
});

/* Read */
export const getPlaces = asyncHandler(async (_req, res) => {
  const places = await Place.find()
    .sort({ createdAt: -1 })
    .populate('reviews.user', 'username profilePicture')
    .populate('beers');

  return sendSuccess(res, {
    message: 'Places retrieved successfully',
    data: places,
  });
});

export const getPlaceById = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id)
    .populate('reviews.user', 'username profilePicture')
    .populate('beers');

  if (!place) {
    return sendError(res, {
      statusCode: 404,
      message: 'Place not found',
    });
  }

  return sendSuccess(res, {
    message: 'Place retrieved successfully',
    data: place,
  });
});

export const getTopRatedPlaces = asyncHandler(async (_req, res) => {
  const places = await Place.find().sort({ averageRating: -1 }).limit(5);

  return sendSuccess(res, {
    message: 'Top rated places retrieved successfully',
    data: places,
  });
});

/* Search */
export const searchPlaces = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const places = await Place.find({
    $or: [
      { name: new RegExp(q, 'i') },
      { 'address.city': new RegExp(q, 'i') },
    ],
  });

  return sendSuccess(res, {
    message: 'Place search completed',
    data: places,
  });
});

/* Reviews */
export const addReview = asyncHandler(async (req, res) => {
  const { comment, rating } = req.body;
  const place = await Place.findById(req.params.id);

  if (!place) {
    return sendError(res, {
      statusCode: 404,
      message: 'Place not found',
    });
  }

  place.reviews.push({
    user: req.user.id,
    comment,
    rating,
  });

  await place.save();

  const updatedPlace = await Place.findById(place._id).populate(
    'reviews.user',
    'username profilePicture'
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Review added successfully',
    data: updatedPlace,
  });
});

/* Update */
export const updatePlace = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    return sendError(res, {
      statusCode: 404,
      message: 'Place not found',
    });
  }

  if (!place.owner || place.owner.toString() !== req.user.id) {
    return sendError(res, {
      statusCode: 403,
      message: 'Forbidden: you are not the owner',
    });
  }

  const updates = { ...req.body };
  if (updates.address) {
    try {
      updates.address = parseAddress(updates.address);
    } catch (_error) {
      return sendError(res, {
        statusCode: 400,
        message: 'Invalid address format',
      });
    }
  }

  Object.assign(place, updates);
  await place.save();

  return sendSuccess(res, {
    message: 'Place updated successfully',
    data: place,
  });
});

/* Delete */
export const deletePlace = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    return sendError(res, {
      statusCode: 404,
      message: 'Place not found',
    });
  }

  if (!place.owner || place.owner.toString() !== req.user.id) {
    return sendError(res, {
      statusCode: 403,
      message: 'Forbidden: you are not the owner',
    });
  }

  await place.deleteOne();

  return sendSuccess(res, {
    message: 'Place deleted successfully',
    data: {},
  });
});

/* Media */
export const uploadPlaceImage = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    return sendError(res, { statusCode: 404, message: 'Place not found' });
  }

  if (!place.owner || place.owner.toString() !== req.user.id) {
    return sendError(res, { statusCode: 403, message: 'Forbidden: you are not the owner' });
  }

  const uploadedFiles = req.files?.length ? req.files : req.file ? [req.file] : [];

  if (!uploadedFiles.length) {
    return sendError(res, { statusCode: 400, message: 'No images uploaded' });
  }

  const newPaths = uploadedFiles.map((f) => `/uploads/places/${f.filename}`);

  if (!place.gallery) place.gallery = [];
  place.gallery.push(...newPaths);

  /* First upload always becomes the cover image */
  if (!place.coverImage) place.coverImage = newPaths[0];

  await place.save();

  return sendSuccess(res, {
    statusCode: 201,
    message: `${newPaths.length} image(s) uploaded successfully`,
    data: { coverImage: place.coverImage, gallery: place.gallery },
  });
});

export const deletePlaceGalleryImage = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    return sendError(res, { statusCode: 404, message: 'Place not found' });
  }

  if (!place.owner || place.owner.toString() !== req.user.id) {
    return sendError(res, { statusCode: 403, message: 'Forbidden: you are not the owner' });
  }

  const idx = parseInt(req.params.index, 10);
  if (isNaN(idx) || idx < 0 || idx >= (place.gallery?.length ?? 0)) {
    return sendError(res, { statusCode: 400, message: 'Invalid image index' });
  }

  const [removed] = place.gallery.splice(idx, 1);

  /* If the deleted image was the cover, promote the next one */
  if (place.coverImage === removed) {
    place.coverImage = place.gallery[0] ?? '';
  }

  await place.save();

  return sendSuccess(res, {
    message: 'Image removed from gallery',
    data: { coverImage: place.coverImage, gallery: place.gallery },
  });
});

export const getNearbyPlaces = asyncHandler(async (_req, res) => {
  logger.warn('getNearbyPlaces endpoint called but not implemented');
  return sendError(res, {
    statusCode: 501,
    message: 'Not implemented yet',
  });
});

export const claimPlace = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    return sendError(res, {
      statusCode: 404,
      message: 'Place not found',
    });
  }

  if (place.owner) {
    return sendError(res, {
      statusCode: 400,
      message: 'This place is already claimed by an owner',
    });
  }

  place.owner = req.user.id;
  place.isFeatured = true; // Auto promote claimed places to partner status
  await place.save();

  const populatedPlace = await Place.findById(place._id)
    .populate('reviews.user', 'username profilePicture')
    .populate('beers');

  return sendSuccess(res, {
    message: 'Place claimed successfully. You are now the owner!',
    data: populatedPlace,
  });
});
