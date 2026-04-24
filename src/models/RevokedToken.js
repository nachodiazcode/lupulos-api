import mongoose from "mongoose";

const RevokedTokenSchema = new mongoose.Schema(
    {
        tokenHash: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        reason: {
            type: String,
            enum: ["logout", "rotation", "compromised", "admin"],
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

/* 🔥 TTL automático */
RevokedTokenSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

export default mongoose.model("RevokedToken", RevokedTokenSchema);
