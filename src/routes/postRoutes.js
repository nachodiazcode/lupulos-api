import express from "express";
import multer from "multer";
import fs from "fs";
import {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getPostComments,
  updatePost,
  uploadPostImage,
  editarComentario,
  eliminarComentario,
  contarVisita,
} from "../controllers/postController.js";

import { verificarToken } from '../middlewares/authMiddleware.js'; // ✅ Middleware para proteger rutas

const router = express.Router();

// 📁 Asegurarse que el directorio exista
const uploadDir = "public/uploads/posts";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 📸 Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/posts"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// 📌 Subida de imagen estilo beerRoutes
router.post("/upload", upload.single("imagen"), (req, res, next) => {
  if (req.file) {
    console.log("🖼️ Imagen recibida:", req.file.filename);
    next();
  } else {
    res.status(400).json({ exito: false, mensaje: "❌ No se subió ningún archivo." });
  }
}, uploadPostImage);

// 📌 Rutas de posts
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

// 📌 Likes
router.post("/:id/like", likePost);
router.post("/:id/unlike", unlikePost);

// 📌 Comentarios
router.post("/:postId/comentario", addComment);
router.get("/:postId/comentarios", getPostComments);
// routes/postRoutes.js (o donde estén)
router.put("/comentario/:id", editarComentario);
router.delete("/comentario/:id", eliminarComentario); // ✅ Eliminar comentario

// 📌 Visita única
router.post("/:postId/visita", verificarToken, contarVisita);

export default router;
