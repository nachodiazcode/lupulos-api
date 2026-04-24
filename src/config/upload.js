import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const sanitizeFilename = (filename = 'file') =>
  filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');

ensureDir(uploadsRoot);

export const createDiskStorage = (folder = 'misc') =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const targetDir = path.join(uploadsRoot, folder);
      ensureDir(targetDir);
      cb(null, targetDir);
    },
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${sanitizeFilename(file.originalname)}`);
    },
  });

export const createUpload = (folder = 'misc', options = {}) =>
  multer({
    storage: createDiskStorage(folder),
    ...options,
  });

export const uploadsBaseDir = uploadsRoot;
