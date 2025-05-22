import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

import {
  getAllBeers,
  getBeerById,
  createBeer,
  updateBeer,
  deleteBeer,
  searchBeers,
  uploadBeerImage,
  rateBeer,
  addBeerReview,
  getTopRatedBeers,
  getFeaturedBeers,
  getNewBeers,
  getBeerOfTheDay,
  createMultipleBeers,
  replyToReview,
  likeBeer,
  likeReview,
  unLikeBeer,
  editReview,
  deleteReview
} from '../controllers/beerController.js';

import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

/* ───────────────────────────────
   🗂️ Configuración de Multer
─────────────────────────────── */

// 📁 Ruta absoluta de almacenamiento
const beersDir = path.join(process.cwd(), 'public', 'uploads', 'beers');

// 🛡️ Crear la carpeta si no existe
if (!fs.existsSync(beersDir)) {
  fs.mkdirSync(beersDir, { recursive: true });
}

// 🛠️ Configuración del storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, beersDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

// 🧽 Filtro opcional para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos de imagen"), false);
  }
};

const upload = multer({ storage, fileFilter });

/* ───────────────────────────────
   🟢 RUTAS GET (Públicas)
─────────────────────────────── */
router.get('/', getAllBeers);
router.get('/search', searchBeers);
router.get('/top-rated', getTopRatedBeers);
router.get('/featured', getFeaturedBeers);
router.get('/new', getNewBeers);
router.get('/beer-of-the-day', getBeerOfTheDay);
router.get('/:id', getBeerById);

/* ───────────────────────────────
   🔐 RUTAS POST (Protegidas)
─────────────────────────────── */
router.post('/', authMiddleware, upload.single("imagen"), createBeer);
router.post('/bulk-create', authMiddleware, createMultipleBeers);
router.post('/:id/upload', authMiddleware, upload.single("imagen"), uploadBeerImage);
router.post('/:id/rate', authMiddleware, rateBeer);
router.post('/:id/review', authMiddleware, addBeerReview);
router.post('/:id/review/:reviewId/reply', authMiddleware, replyToReview);
router.post('/:id/review/:reviewId/like', authMiddleware, likeReview);
router.post('/:id/like', authMiddleware, likeBeer);
router.post('/:id/unlike', authMiddleware, unLikeBeer);

/* ───────────────────────────────
   🔐 RUTAS PUT (Protegidas)
─────────────────────────────── */
router.put('/:id', authMiddleware, updateBeer);
router.put('/:id/review/:reviewId', authMiddleware, editReview);

/* ───────────────────────────────
   🔐 RUTAS DELETE (Protegidas)
─────────────────────────────── */
router.delete('/:id', authMiddleware, deleteBeer);
router.delete('/:id/review/:reviewId', authMiddleware, deleteReview);

export default router;
