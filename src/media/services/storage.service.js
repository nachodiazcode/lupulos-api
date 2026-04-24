/**
 * Storage service — local implementation with an S3-ready interface.
 *
 * Interface contract (IStorageService):
 *   upload(buffer, filePath, mimetype)  → Promise<string>  (stored relative path)
 *   delete(filePath)                    → Promise<void>
 *   getSignedUrl(filePath, expiresIn?)  → Promise<string>  (full public URL)
 *
 * To swap in S3StorageService: inject a different implementation via the
 * STORAGE_SERVICE token (see media-upload.service.js factory comment).
 */

import fs from 'fs/promises';
import path from 'path';

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads');
const BASE_URL = (process.env.MEDIA_BASE_URL || `http://localhost:${process.env.PORT || 3940}`).replace(/\/$/, '');

class LocalStorageService {
  /**
   * Write a Buffer to disk under public/uploads/{filePath}.
   * @param {Buffer} buffer
   * @param {string} filePath  Relative path e.g. "2026/04/post/abc/uuid.jpg"
   * @returns {Promise<string>} The same relative path (stored in DB)
   */
  async upload(buffer, filePath) {
    const abs = path.join(UPLOADS_ROOT, filePath);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, buffer);
    return filePath;
  }

  /**
   * Delete a file from disk. Silently ignores ENOENT.
   * @param {string} filePath
   */
  async delete(filePath) {
    try {
      await fs.unlink(path.join(UPLOADS_ROOT, filePath));
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  /**
   * Build a full public URL for a stored relative path.
   * For local storage this is synchronous; the async signature keeps
   * the interface compatible with S3 pre-signed URLs.
   * @param {string} filePath
   * @returns {Promise<string>}
   */
  async getSignedUrl(filePath) {
    return this.buildUrl(filePath);
  }

  /**
   * Synchronous URL builder — convenience for internal service use.
   * @param {string|null|undefined} filePath
   * @returns {string|null}
   */
  buildUrl(filePath) {
    if (!filePath) return null;
    const normalized = filePath.replace(/\\/g, '/').replace(/^\//, '');
    return `${BASE_URL}/uploads/${normalized}`;
  }
}

export const storageService = new LocalStorageService();
export default storageService;
