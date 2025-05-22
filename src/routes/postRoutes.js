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
  uploadPostImage, // ✅ Renombrado como en beerRoutes
} from "../controllers/postController.js";
import { contarVisita } from "../controllers/postController.js";

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
}, uploadPostImage); // 👈 debe existir en postController.js

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

router.put("/:id", updatePost); // 👈 esta es la que te falta


router.post("/:postId/visita", contarVisita);


export default router;
