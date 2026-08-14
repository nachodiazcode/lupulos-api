import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import bcrypt from "bcryptjs";

/* =========================
   Sub-schemas
========================= */

const badgeSchema = new mongoose.Schema({
  name: String,
  description: String,
  icon: String,
  obtainedAt: { type: Date, default: Date.now },
});

const tastingNoteSchema = new mongoose.Schema({
  beer: { type: mongoose.Schema.Types.ObjectId, ref: "Beer", required: true },
  aroma: String,
  flavor: String,
  bitterness: { type: Number, min: 1, max: 5 },
  generalComment: String,
  date: { type: Date, default: Date.now },
});

const reportSchema = new mongoose.Schema({
  reason: String,
  date: { type: Date, default: Date.now },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const historySchema = new mongoose.Schema({
  action: String,
  date: { type: Date, default: Date.now },
  referenceId: mongoose.Schema.Types.ObjectId,
  type: String,
});

const flavorPreferencesSchema = new mongoose.Schema({
  bitterness: { type: Number, default: 3, min: 1, max: 5 },
  sweetness: { type: Number, default: 3, min: 1, max: 5 },
  aroma: { type: Number, default: 3, min: 1, max: 5 },
});

const notificationsSchema = new mongoose.Schema({
  comments: { type: Boolean, default: true },
  likes: { type: Boolean, default: true },
  newFollowers: { type: Boolean, default: true },
});

/* =========================
   User Schema
========================= */

const userSchema = new mongoose.Schema(
  {
    // Basic credentials
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      minlength: 6,
      select: false,
    },
    provider: { type: String, default: "local" },

    // Profile & personalization
    profilePicture: {
      type: String,
      default: function () {
        return `https://ui-avatars.com/api/?name=${this.username}`;
      },
    },
    bannerPicture: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 280 },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    birthDate: { type: Date },
    favoriteStyle: { type: String, default: "" },
    isPublic: { type: Boolean, default: true },

    // Notifications
    notifications: { type: notificationsSchema, default: () => ({}) },

    // Security & account status
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String, default: null },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: "" },

    // Social relationships
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Activity tracking
    beersCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Beer" }],
    placesCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Place" }],
    postsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],

    // Preferences
    flavorPreferences: {
      type: flavorPreferencesSchema,
      default: () => ({}),
    },

    // Gamification
    badges: [badgeSchema],

    // Tasting notes
    tastingNotes: [tastingNoteSchema],

    // Metrics & history
    loginCount: { type: Number, default: 0 },
    lastLogin: { type: Date },
    reputation: { type: Number, default: 0 },
    history: [historySchema],

    // Reports
    reportsReceived: [reportSchema],

    // Roles & permissions
    role: {
      type: String,
      enum: ["owner", "admin", "moderator", "user"],
      default: "user",
    },
    customPermissions: [{ type: String }],

    // Subscriptions
    hasActiveSubscription: { type: Boolean, default: false },
    plan: {
      type: String,
      enum: ["free", "lupuloso", "pro", "explorer"],
      default: "free",
    },
    activeSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* =========================
   Indexes
========================= */

userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });
userSchema.index({ role: 1 });
userSchema.index({ plan: 1 });

/* =========================
   Virtuals
========================= */

userSchema.virtual("followersCount").get(function () {
  return this.followers?.length || 0;
});

userSchema.virtual("followingCount").get(function () {
  return this.following?.length || 0;
});

/* =========================
   Hooks & Methods
========================= */

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

/* =========================
   Plugins & Export
========================= */

userSchema.plugin(mongoosePaginate);

const User = mongoose.model("User", userSchema);
export default User;
