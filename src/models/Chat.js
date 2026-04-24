import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],

        isGroup: { type: Boolean, default: false },
        chatType: {
            type: String,
            enum: ["community", "b2b", "ai"],
            default: "community",
            index: true,
        },
        name: { type: String, default: "" }, // grupos
        globalRoomKey: {
            type: String,
            trim: true,
            default: undefined,
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },

        mutedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    {
        timestamps: true,
    }
);

/* Indexes */
ChatSchema.index({ participants: 1 });
ChatSchema.index({ updatedAt: -1 });
ChatSchema.index(
    { globalRoomKey: 1 },
    {
        unique: true,
        partialFilterExpression: {
            globalRoomKey: { $exists: true, $type: "string" },
        },
    }
);

export default mongoose.model("Chat", ChatSchema);
