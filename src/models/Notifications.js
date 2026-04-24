import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        type: {
            type: String,
            enum: [
                "like",
                "comment",
                "reply",
                "follow",
                "message",
                "mention",
            ],
            required: true,
        },

        entityType: {
            type: String,
            enum: ["post", "comment", "beer", "message"],
            required: true,
        },

        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

/* Indexes */
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model("Notification", NotificationSchema);
