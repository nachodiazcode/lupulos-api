import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        refreshTokenHash: {
            type: String,
            required: true,
            unique: true,
        },

        userAgent: {
            type: String,
        },

        ipAddress: {
            type: String,
        },

        isValid: {
            type: Boolean,
            default: true,
            index: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// 🔥 TTL automático: Mongo borra sesiones expiradas
SessionSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

const Session = mongoose.model("Session", SessionSchema);
export default Session;
