import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
            index: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: ["text", "image", "video", "audio", "file"],
            default: "text",
        },

        content: { type: String }, // texto o URL
        metadata: {
            duration: Number, // audio/video
            size: Number,     // archivos
        },

        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },

        deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

        readBy: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                readAt: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    }
);

/* Indexes */
MessageSchema.index({ chat: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });

export default mongoose.model("Message", MessageSchema);
