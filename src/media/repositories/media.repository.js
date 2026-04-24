import Media from '../models/Media.js';
import { MediaStatus } from '../enums/media-type.enum.js';

const RECOVERY_WINDOW_MS = 24 * 60 * 60 * 1000;

class MediaRepository {
  /** @param {object} data */
  async create(data) {
    return await Media.create(data);
  }

  /** @param {string} id */
  async findById(id) {
    return await Media.findOne({ _id: id, status: { $ne: MediaStatus.DELETED } });
  }

  /** @param {string} entityId  @param {string} contextType */
  async findByEntity(entityId, contextType) {
    return await Media.find({ entityId, contextType, status: MediaStatus.ACTIVE }).sort({
      createdAt: -1,
    });
  }

  /** @param {string} id  @param {object} data */
  async update(id, data) {
    return await Media.findByIdAndUpdate(id, data, { new: true });
  }

  /** @param {string} id */
  async softDelete(id) {
    return await Media.findByIdAndUpdate(
      id,
      { status: MediaStatus.DELETED, deletedAt: new Date() },
      { new: true }
    );
  }

  /** @param {string} id  @param {string} derivativePath  @param {string[]} [thumbnailPaths] */
  async setDerivative(id, derivativePath, thumbnailPaths) {
    const update = { derivativePath };
    if (thumbnailPaths?.length) update.thumbnailPaths = thumbnailPaths;
    return await Media.findByIdAndUpdate(id, update, { new: true });
  }

  /** @param {string} id  @param {object} editOp */
  async appendImageEdit(id, editOp) {
    return await Media.findByIdAndUpdate(
      id,
      { $push: { 'editHistory.image': editOp } },
      { new: true }
    );
  }

  /** @param {string} id  @param {object} editOp */
  async appendVideoEdit(id, editOp) {
    return await Media.findByIdAndUpdate(
      id,
      { $push: { 'editHistory.video': editOp } },
      { new: true }
    );
  }

  /** Returns docs soft-deleted more than 24 h ago (ready for hard purge). */
  async findExpiredDeleted() {
    const cutoff = new Date(Date.now() - RECOVERY_WINDOW_MS);
    return await Media.find({ status: MediaStatus.DELETED, deletedAt: { $lte: cutoff } });
  }
}

export default new MediaRepository();
