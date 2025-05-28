// middlewares/uploadProfileImage.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Ruta de destino
const dir = path.join("public", "uploads", "profile");

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

export const uploadProfileImage = multer({ storage });
