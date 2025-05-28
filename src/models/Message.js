import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      trim: true,
    },
    media: {
      url: { type: String },
      type: {
        type: String,
        enum: ['image', 'video', 'audio', 'file'],
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    reactions: [
      {
        emoji: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editHistory: [
      {
        previousText: String,
        editedAt: { type: Date, default: Date.now },
      },
    ],
    selfDestructAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt y updatedAt automáticos
  }
);

export default mongoose.model('Message', messageSchema);
