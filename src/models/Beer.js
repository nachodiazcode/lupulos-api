import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * Reply schema (nested inside reviews)
 */
const ReplySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    video: { type: String, default: "" },
  },
  { _id: true }
);

/**
 * Review schema
 */
const ReviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comment: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    video: { type: String, default: "" },
    replies: [ReplySchema],
  },
  { _id: true }
);

/**
 * Beer schema
 */
const BeerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brewery: { type: String, required: true, trim: true },
    style: { type: String, required: true, trim: true, alias: 'beerStyle' },
    abv: { type: Number, required: true, min: 0, max: 20 },
    description: { type: String, trim: true },
    image: { type: String },
    images: { type: [String], default: [] },
    video: { type: String, default: "" },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    reviews: [ReviewSchema],

    averageRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes (performance)
 */
BeerSchema.index({ name: 1 });
BeerSchema.index({ brewery: 1 });
BeerSchema.index({ style: 1 });
BeerSchema.index({ averageRating: -1 });

BeerSchema.plugin(mongoosePaginate);

export default mongoose.model("Beer", BeerSchema);
