import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getPostComments,
  uploadPostImage,
} from "../controllers/postController.js";

const router = express.Router();

// 📁 Ruta absoluta al directorio uploads/posts
const uploadsPath = path.join(__dirname, "../uploads/posts");

// 📁 Asegurarse que el directorio exista
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// 📸 Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// 📌 Subida de imagen (estilo beerRoutes)
router.post("/upload", upload.single("imagen"), (req, res, next) => {
  if (req.file) {
    console.log("🖼️ Imagen recibida:", req.file.filename);
    next();
  } else {
    return res.status(400).json({
      exito: false,
      mensaje: "❌ No se subió ningún archivo.",
    });
  }
}, uploadPostImage);

// 📌 Rutas de posts
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.post("/", createPost);
router.delete("/:id", deletePost);

// 📌 Likes
router.post("/:id/like", likePost);
router.post("/:id/unlike", unlikePost);

// 📌 Comentarios
router.post("/:postId/comentario", addComment);
router.get("/:postId/comentarios", getPostComments);

export default router;
