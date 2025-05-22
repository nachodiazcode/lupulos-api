import fs from 'fs';
import path from 'path';
import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/authMiddleware.js';

import {
  createLocation,
  createMultipleLocations,
  updateLocation,
  deleteLocation,
  getLocations,
  getTopRatedLocations,
  getNearbyLocations,
  getLocationById,
  filterLocationsByBeerType,
  searchLocations,
  addReviewToLocation,
  editReviewLocation,
  deleteReviewLocation,
  toggleFavoriteLocation,
  uploadLocationImage,
  uploadValidationVideo
} from '../controllers/locationsController.js';

const router = express.Router();

// 📦 Multer con autocreación de carpetas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isVideo = file.mimetype.startsWith('video/');
    const folder = isVideo
      ? path.join('public', 'uploads', 'videos')
      : path.join('public', 'uploads', 'locations');

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});


const upload = multer({ storage });

/* ──────────────── Rutas públicas ──────────────── */
router.get('/', getLocations);
router.get('/top-rated', getTopRatedLocations);
router.get('/search', searchLocations);
router.get('/filter-by-beer', filterLocationsByBeerType);
router.get('/nearby', getNearbyLocations);
router.get('/:id', getLocationById);

/* ──────────────── Rutas protegidas ──────────────── */
router.post('/', authMiddleware, upload.single('imagen'), createLocation);
router.post('/multiple', authMiddleware, createMultipleLocations);
router.patch('/:id', authMiddleware, updateLocation);
router.delete('/:id', authMiddleware, deleteLocation);

// 📥 Reviews
router.post('/:id/review', authMiddleware, addReviewToLocation);
router.put('/:id/review/:reviewId', authMiddleware, editReviewLocation);
router.delete('/:id/review/:reviewId', authMiddleware, deleteReviewLocation);

// 📸 Uploads
router.post('/:id/upload-image', authMiddleware, upload.single('image'), uploadLocationImage);
router.post('/:id/upload-video', authMiddleware, upload.single('video'), uploadValidationVideo);

// ⭐ Favoritos
router.post('/:id/toggle-favorite', authMiddleware, toggleFavoriteLocation);




export default router;
