import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    chatName: {
      type: String,
      trim: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    image: {
      type: String, // URL o ruta de imagen
      default: '',
    },

    // ✅ Último mensaje para vista previa
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },

    // ✅ Leídos por usuarios
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
      },
    ],

    // ✅ Usuarios que silenciaron el chat
    mutedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // ✅ Usuarios baneados (para grupos)
    bannedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // ✅ Estado de escritura
    typingStatus: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isTyping: { type: Boolean, default: false },
      },
    ],

    // ✅ Mensaje anclado
    pinnedMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },

    // ✅ Historial de nombres de grupo
    nameHistory: [
      {
        name: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
      },
    ],

    // ✅ Soft delete para ciertos usuarios
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // ✅ Estética personalizada del chat
    theme: {
      color: { type: String, default: '#fbbf24' },
      background: { type: String, default: '#1f1f1f' },
      mode: {
        type: String,
        enum: ['light', 'dark'],
        default: 'dark',
      },
    },

    // ✅ Encuestas dentro del chat
    polls: [
      {
        question: String,
        options: [
          {
            text: String,
            votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
          },
        ],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        expiresAt: Date,
      },
    ],

    // ✅ Estadísticas de interacción (gamificación)
    interactionStats: {
      totalMessages: { type: Number, default: 0 },
      reactionsGiven: { type: Number, default: 0 },
      reactionsReceived: { type: Number, default: 0 },
    },

    // ✅ Autodestrucción de mensajes estilo Telegram
    selfDestructIn: {
      type: Number, // segundos
      default: null,
    },

    // ✅ Fijar el chat arriba
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual para acceder a los mensajes del chat
chatSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'chatId',
});

export default mongoose.model('Chat', chatSchema);
