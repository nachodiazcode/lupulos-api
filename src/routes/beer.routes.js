import express from 'express';
import { createUpload } from '../config/upload.js';
import validateRequest from '../middlewares/validateRequest.js';
import { beerValidation } from '../validations/requestSchemas.js';
import { authMiddleware } from '../middlewares/index.js';

import {
  getAllBeers,
  getBeerById,
  searchBeers,
  getTopRatedBeers,
  getNewBeers,
  createBeer,
  updateBeer,
  deleteBeer,
  toggleLikeBeer,
  addBeerReview,
  uploadBeerImages,
  deleteBeerImage,
} from '../controllers/beer.controller.js';

const router = express.Router();

const upload = createUpload('beers', {
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      return callback(null, true);
    }
    return callback(new Error('Only image files are allowed'), false);
  },
  limits: { fileSize: 8 * 1024 * 1024 },
});

/* Public routes */
router.get('/', getAllBeers);
router.get('/search', validateRequest(beerValidation.searchBeers), searchBeers);
router.get('/top-rated', getTopRatedBeers);
router.get('/new', getNewBeers);
router.get('/:id', validateRequest(beerValidation.beerIdParam), getBeerById);

/* Protected routes */
router.post(
  '/',
  authMiddleware,
  upload.array('images', 10),
  validateRequest(beerValidation.createBeer),
  createBeer
);

router.post(
  '/:id/images',
  authMiddleware,
  validateRequest(beerValidation.beerIdParam),
  upload.array('images', 10),
  uploadBeerImages
);

router.delete(
  '/:id/images/:index',
  authMiddleware,
  validateRequest(beerValidation.beerIdParam),
  deleteBeerImage
);

router.post(
  '/:id/toggle-like',
  authMiddleware,
  validateRequest(beerValidation.beerIdParam),
  toggleLikeBeer
);

router.post(
  '/:id/review',
  authMiddleware,
  validateRequest(beerValidation.reviewBeer),
  addBeerReview
);

router.put(
  '/:id',
  authMiddleware,
  validateRequest(beerValidation.updateBeer),
  updateBeer
);

router.delete(
  '/:id',
  authMiddleware,
  validateRequest(beerValidation.beerIdParam),
  deleteBeer
);

export default router;
