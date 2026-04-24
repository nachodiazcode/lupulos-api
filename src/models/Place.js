import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true }
);

const EventSchema = new mongoose.Schema(
    {
        name: { type: String, trim: true },
        description: { type: String, trim: true },
        date: { type: Date },
    },
    { _id: true }
);

const PromotionSchema = new mongoose.Schema(
    {
        description: { type: String, trim: true },
        discountPercent: { type: Number, min: 0, max: 100 },
        startDate: { type: Date },
        endDate: { type: Date },
    },
    { _id: true }
);

const PlaceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        address: {
            street: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            state: { type: String, required: true, trim: true },
            country: { type: String, required: true, trim: true },
            postalCode: { type: String, trim: true },
        },

        coordinates: {
            lat: { type: Number },
            lng: { type: Number },
        },

        phone: { type: String, trim: true },
        website: { type: String, trim: true },
        contactEmail: { type: String, trim: true },

        coverImage: { type: String },
        gallery: [{ type: String }],

        beers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Beer',
            },
        ],

        reviews: [ReviewSchema],

        averageRating: {
            type: Number,
            default: 0,
        },

        openingHours: {
            monday: { open: String, close: String },
            tuesday: { open: String, close: String },
            wednesday: { open: String, close: String },
            thursday: { open: String, close: String },
            friday: { open: String, close: String },
            saturday: { open: String, close: String },
            sunday: { open: String, close: String },
        },

        socialLinks: {
            facebook: { type: String },
            instagram: { type: String },
            twitter: { type: String },
            tiktok: { type: String },
        },

        events: [EventSchema],
        promotions: [PromotionSchema],

        amenities: [{ type: String }],

        isPetFriendly: { type: Boolean, default: false },
        hasLiveMusic: { type: Boolean, default: false },
        hasTerrace: { type: Boolean, default: false },
        hasParking: { type: Boolean, default: false },

        visits: { type: Number, default: 0 },
        popularityScore: { type: Number, default: 0 },
        isFeatured: { type: Boolean, default: false },

        level: { type: Number, default: 1 },
        rewardPoints: { type: Number, default: 0 },
        hasBeerTrivia: { type: Boolean, default: false },

        isPremiumOnly: { type: Boolean, default: false },
        minimumAge: { type: Number, default: 18 },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            alias: 'placeOwner',
        },
    },
    {
        timestamps: true,
    }
);

/* Indexes */
PlaceSchema.index({ 'address.city': 1 });
PlaceSchema.index({ 'address.country': 1 });
PlaceSchema.index({ averageRating: -1 });
PlaceSchema.index({ popularityScore: -1 });
PlaceSchema.index({ isFeatured: 1 });
PlaceSchema.index({ createdAt: -1 });

export default mongoose.model('Place', PlaceSchema);
