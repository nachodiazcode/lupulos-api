import express from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { createUpload } from '../config/upload.js';
import validateRequest from '../middlewares/validateRequest.js';
import { placeValidation } from '../validations/requestSchemas.js';

import {
  createPlace,
  createMultiplePlaces,
  updatePlace,
  deletePlace,
  getPlaces,
  getTopRatedPlaces,
  getNearbyPlaces,
  getPlaceById,
  searchPlaces,
  addReview,
  uploadPlaceImage,
  deletePlaceGalleryImage,
  claimPlace,
} from '../controllers/places.controller.js';

const router = express.Router();

const placesWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many place write requests, try again later.',
});

const placeUpload = createUpload('places', {
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      return callback(null, true);
    }
    return callback(new Error('Only image files are allowed'));
  },
});

/* Public routes */
router.get('/', getPlaces);
router.get('/top-rated', getTopRatedPlaces);
router.get('/search', validateRequest(placeValidation.placeSearch), searchPlaces);
router.get('/nearby', getNearbyPlaces);
router.get('/:id', validateRequest(placeValidation.placeIdParam), getPlaceById);

/* Protected routes */
router.post(
  '/',
  placesWriteLimiter,
  authMiddleware,
  placeUpload.array('images', 10),
  validateRequest(placeValidation.createPlace),
  createPlace
);

router.post(
  '/bulk',
  placesWriteLimiter,
  authMiddleware,
  validateRequest(placeValidation.createBulkPlaces),
  createMultiplePlaces
);

router.patch(
  '/:id/claim',
  placesWriteLimiter,
  authMiddleware,
  validateRequest(placeValidation.placeIdParam),
  claimPlace
);

router.patch(
  '/:id',
  placesWriteLimiter,
  authMiddleware,
  validateRequest(placeValidation.updatePlace),
  updatePlace
);

router.delete(
  '/:id',
  placesWriteLimiter,
  authMiddleware,
  validateRequest(placeValidation.placeIdParam),
  deletePlace
);

/* Reviews */
router.post(
  '/:id/reviews',
  placesWriteLimiter,
  authMiddleware,
  validateRequest(placeValidation.placeReview),
  addReview
);

/* Media */
router.post(
  '/:id/images',
  placesWriteLimiter,
  authMiddleware,
  validateRequest(placeValidation.placeIdParam),
  placeUpload.array('images', 10),
  uploadPlaceImage
);

router.delete(
  '/:id/images/:index',
  placesWriteLimiter,
  authMiddleware,
  validateRequest(placeValidation.placeIdParam),
  deletePlaceGalleryImage
);

export default router;
