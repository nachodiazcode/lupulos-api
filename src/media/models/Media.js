import mongoose from 'mongoose';
import { MediaType, ContextType, MediaStatus } from '../enums/media-type.enum.js';
import { FilterType } from '../enums/filter-type.enum.js';

const ALL_FILTERS = Object.values(FilterType);
const ALL_RATIOS = ['original', '1:1', '4:5', '9:16', '16:9', '3:4', '4:3'];

/* ── Shared sub-schemas ─────────────────────────────────────────────────── */

const PositionSchema = new mongoose.Schema(
  { x: { type: Number, required: true }, y: { type: Number, required: true } },
  { _id: false }
);

const CropSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false }
);

const TextOverlaySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    fontFamily: { type: String, default: 'Arial' },
    fontSize: { type: Number, default: 24 },
    color: { type: String, default: '#ffffff' },
    position: { type: PositionSchema, required: true },
    backgroundColor: String,
    backgroundOpacity: { type: Number, default: 0 },
    bold: { type: Boolean, default: false },
    italic: { type: Boolean, default: false },
  },
  { _id: false }
);

/* ── Image edit operation ───────────────────────────────────────────────── */

const ImageEditSchema = new mongoose.Schema(
  {
    appliedAt: { type: Date, default: Date.now },
    filter: { type: String, enum: ALL_FILTERS, default: FilterType.NONE },
    adjustments: {
      brightness: { type: Number, default: 100 },
      contrast: { type: Number, default: 100 },
      saturation: { type: Number, default: 100 },
      sharpness: { type: Number, default: 0 },
      blur: { type: Number, default: 0 },
      vignette: { type: Number, default: 0 },
      fade: { type: Number, default: 0 },
      highlights: { type: Number, default: 0 },
      shadows: { type: Number, default: 0 },
      warmth: { type: Number, default: 0 },
      tint: { type: Number, default: 0 },
      grain: { type: Number, default: 0 },
    },
    transform: {
      rotate: { type: Number, enum: [0, 90, 180, 270], default: 0 },
      flipHorizontal: { type: Boolean, default: false },
      flipVertical: { type: Boolean, default: false },
      crop: CropSchema,
      aspectRatio: { type: String, enum: ALL_RATIOS, default: 'original' },
    },
    textOverlays: { type: [TextOverlaySchema], default: [] },
    stickerOverlay: {
      overlayUrl: String,
      position: PositionSchema,
      scale: { type: Number, default: 1 },
      rotation: { type: Number, default: 0 },
      opacity: { type: Number, default: 1 },
    },
    output: {
      format: { type: String, enum: ['jpeg', 'png', 'webp'], default: 'jpeg' },
      quality: { type: Number, default: 85 },
      width: Number,
      height: Number,
    },
  },
  { _id: false }
);

/* ── Video text overlay (extends base with timing) ──────────────────────── */

const VideoTextOverlaySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    fontFamily: { type: String, default: 'Arial' },
    fontSize: { type: Number, default: 24 },
    color: { type: String, default: '#ffffff' },
    position: { type: PositionSchema, required: true },
    backgroundColor: String,
    backgroundOpacity: { type: Number, default: 0 },
    bold: { type: Boolean, default: false },
    italic: { type: Boolean, default: false },
    startTime: { type: Number, default: 0 },
    endTime: Number,
  },
  { _id: false }
);

/* ── Video edit operation ───────────────────────────────────────────────── */

const VideoEditSchema = new mongoose.Schema(
  {
    appliedAt: { type: Date, default: Date.now },
    trim: {
      startTime: { type: Number, default: 0 },
      endTime: Number,
    },
    speed: { type: Number, default: 1 },
    filter: { type: String, enum: ALL_FILTERS, default: FilterType.NONE },
    adjustments: {
      brightness: { type: Number, default: 0 },
      contrast: { type: Number, default: 0 },
      saturation: { type: Number, default: 0 },
    },
    transform: {
      rotate: { type: Number, enum: [0, 90, 180, 270], default: 0 },
      flipHorizontal: { type: Boolean, default: false },
      flipVertical: { type: Boolean, default: false },
      crop: CropSchema,
      aspectRatio: { type: String, enum: ALL_RATIOS, default: 'original' },
    },
    audio: {
      mute: { type: Boolean, default: false },
      volume: { type: Number, default: 100 },
      fadeInDuration: Number,
      fadeOutDuration: Number,
    },
    textOverlays: { type: [VideoTextOverlaySchema], default: [] },
    thumbnailAt: Number,
    output: {
      format: { type: String, enum: ['mp4', 'webm'], default: 'mp4' },
      resolution: {
        type: String,
        enum: ['480p', '720p', '1080p', 'original'],
        default: 'original',
      },
      fps: { type: mongoose.Schema.Types.Mixed, default: 'original' },
    },
  },
  { _id: false }
);

/* ── Root Media schema ──────────────────────────────────────────────────── */

const MediaSchema = new mongoose.Schema(
  {
    originalPath: { type: String, required: true, trim: true },
    derivativePath: { type: String, trim: true },
    thumbnailPaths: { type: [String], default: [] },

    mediaType: {
      type: String,
      enum: Object.values(MediaType),
      required: true,
      index: true,
    },
    contextType: {
      type: String,
      enum: Object.values(ContextType),
      required: true,
      index: true,
    },
    entityId: { type: String, trim: true, index: true },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    mimeType: { type: String, required: true },
    originalFilename: { type: String, trim: true },
    size: { type: Number, required: true },
    width: Number,
    height: Number,
    duration: Number,

    editHistory: {
      image: { type: [ImageEditSchema], default: [] },
      video: { type: [VideoEditSchema], default: [] },
    },

    status: {
      type: String,
      enum: Object.values(MediaStatus),
      default: MediaStatus.ACTIVE,
      index: true,
    },
    deletedAt: { type: Date, sparse: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

MediaSchema.index({ uploadedBy: 1, createdAt: -1 });
MediaSchema.index({ contextType: 1, entityId: 1 });
MediaSchema.index({ status: 1, deletedAt: 1 });

export default mongoose.model('Media', MediaSchema);
