import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import Beer from '../models/Beer.js';
import Place from '../models/Place.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendError, sendSuccess } from '../utils/responseHandler.js';
import { emitChatMessageNew } from '../services/chatRealtime.service.js';
import {
  ensureGlobalCommunityChat,
  canAccessChat,
  isGlobalCommunityChat,
  populateChatQuery,
  CHAT_USER_SELECT,
  GLOBAL_COMMUNITY_ROOM_KEY,
  GLOBAL_COMMUNITY_ROOM_NAME,
} from '../services/communityChat.service.js';

const BAD_WORDS = [
  'ctm',
  'culiao',
  'culiáo',
  'conchetumadre',
  'qlo',
  'qliao',
  'maricon',
  'maricón',
  'puta',
  'mierda',
];

const normalizeText = (text = '') =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const toPlainObject = (value) =>
  value?.toObject ? value.toObject() : value;

const toStringId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value.toString === 'function') return value.toString();
  return String(value);
};

const normalizeMessageInput = (content = '') =>
  String(content).replace(/\u0000/g, '').trim();

const moderateContent = (content = '') => {
  let sanitized = content;
  let flagged = false;

  for (const badWord of BAD_WORDS) {
    const matcher = new RegExp(`\\b${badWord}\\b`, 'gi');
    if (matcher.test(sanitized)) {
      flagged = true;
      sanitized = sanitized.replace(matcher, '***');
    }
  }

  return { flagged, sanitized };
};

const serializeUserLite = (user) => {
  const plainUser = toPlainObject(user);

  if (!plainUser) {
    return null;
  }

  const profilePicture =
    plainUser.profilePicture || plainUser.fotoPerfil || undefined;
  const userId = toStringId(plainUser._id || plainUser.id);

  return {
    ...plainUser,
    _id: userId,
    id: userId,
    username: plainUser.username,
    profilePicture,
    fotoPerfil: profilePicture,
  };
};

const serializeMessage = (message) => {
  const plainMessage = toPlainObject(message);

  if (!plainMessage) {
    return null;
  }

  const messageId = toStringId(plainMessage._id || plainMessage.id);

  return {
    ...plainMessage,
    _id: messageId,
    id: messageId,
    chat: plainMessage.chat
      ? toStringId(plainMessage.chat._id || plainMessage.chat)
      : plainMessage.chat,
    sender: serializeUserLite(plainMessage.sender),
    createdAt: plainMessage.createdAt
      ? new Date(plainMessage.createdAt).toISOString()
      : plainMessage.createdAt,
    updatedAt: plainMessage.updatedAt
      ? new Date(plainMessage.updatedAt).toISOString()
      : plainMessage.updatedAt,
  };
};

const serializeChat = (chat) => {
  const plainChat = toPlainObject(chat);

  if (!plainChat) {
    return null;
  }

  const chatId = toStringId(plainChat._id || plainChat.id);

  return {
    ...plainChat,
    _id: chatId,
    id: chatId,
    name: plainChat.name || (isGlobalCommunityChat(plainChat) ? GLOBAL_COMMUNITY_ROOM_NAME : ''),
    isGroup: Boolean(plainChat.isGroup),
    chatType: plainChat.chatType,
    participants: Array.isArray(plainChat.participants)
      ? plainChat.participants.map(serializeUserLite).filter(Boolean)
      : [],
    lastMessage: plainChat.lastMessage
      ? serializeMessage(plainChat.lastMessage)
      : null,
    createdAt: plainChat.createdAt
      ? new Date(plainChat.createdAt).toISOString()
      : plainChat.createdAt,
    updatedAt: plainChat.updatedAt
      ? new Date(plainChat.updatedAt).toISOString()
      : plainChat.updatedAt,
  };
};

const populateMessageQuery = (query) =>
  query.populate('sender', CHAT_USER_SELECT);

/**
 * Create or return existing one-to-one chat
 */
export const createOrGetChat = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { targetUserId, chatType = 'community' } = req.body;

  if (!targetUserId || targetUserId === userId) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid target user',
    });
  }

  let chat = await Chat.findOne({
    isGroup: false,
    chatType,
    participants: { $all: [userId, targetUserId] },
  })
    .populate('participants', 'username profilePicture role')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'username profilePicture role' },
    });

  if (!chat) {
    chat = await Chat.create({
      participants: [userId, targetUserId],
      isGroup: false,
      chatType,
    });
    chat = await populateChatQuery(Chat.findById(chat._id));
  }

  return sendSuccess(res, {
    message: 'Chat ready',
    data: serializeChat(chat),
  });
});

export const getGlobalCommunityRoom = asyncHandler(async (_req, res) => {
  const globalChat = await ensureGlobalCommunityChat();

  return sendSuccess(res, {
    message: 'Global community chat ready',
    data: serializeChat(globalChat),
  });
});

/**
 * Send message to a chat with moderation
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;
  const normalizedContent = normalizeMessageInput(req.body?.content || '');

  if (!normalizedContent) {
    return sendError(res, {
      statusCode: 400,
      message: 'Message content is required',
    });
  }

  const chat = await Chat.findById(chatId);

  if (!chat || !canAccessChat(chat, userId)) {
    return sendError(res, {
      statusCode: 403,
      message: 'Access denied',
    });
  }

  const moderation = moderateContent(normalizedContent);

  const message = await Message.create({
    chat: chatId,
    sender: userId,
    type: 'text',
    content: moderation.sanitized,
    readBy: [{ user: userId }],
  });

  await Chat.updateOne(
    { _id: chatId },
    { $set: { lastMessage: message._id, updatedAt: new Date() } }
  );

  const populatedMessage = await populateMessageQuery(Message.findById(message._id));
  const serializedMessage = serializeMessage(populatedMessage);

  await emitChatMessageNew({
    event: 'chat:message:new',
    chatId: toStringId(chat._id),
    chatType: chat.chatType,
    isGlobal: isGlobalCommunityChat(chat),
    message: serializedMessage,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Message sent successfully',
    data: {
      message: serializedMessage,
      moderation: { flagged: moderation.flagged },
    },
  });
});

/**
 * AI assistant query for beer and place discovery
 */
export const aiAssistantQuery = asyncHandler(async (req, res) => {
  const { query = '' } = req.body;
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return sendError(res, {
      statusCode: 400,
      message: 'Query is required',
    });
  }

  const safeRegex = new RegExp(
    normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    'i'
  );

  const [beers, places] = await Promise.all([
    Beer.find({
      $or: [
        { name: safeRegex },
        { brewery: safeRegex },
        { style: safeRegex },
        { description: safeRegex },
      ],
    })
      .limit(5)
      .sort({ averageRating: -1 })
      .select('name brewery style abv averageRating'),
    Place.find({
      $or: [
        { name: safeRegex },
        { description: safeRegex },
        { 'address.city': safeRegex },
        { amenities: safeRegex },
      ],
    })
      .limit(5)
      .sort({ averageRating: -1 })
      .select(
        'name description averageRating address.city isPetFriendly hasLiveMusic'
      ),
  ]);

  const normalizedText = normalizeText(normalizedQuery);
  const tips = [];

  if (normalizedText.includes('ipa')) {
    tips.push(
      'Tip IA: si te gustan las IPA, ordena por rating y filtra por ABV 5-7% para sesiones largas.'
    );
  }

  if (
    normalizedText.includes('pet') ||
    normalizedText.includes('perro')
  ) {
    tips.push(
      'Tip IA: busca lugares pet-friendly y con terraza para una mejor experiencia.'
    );
  }

  if (normalizedText.includes('stout')) {
    tips.push(
      'Tip IA: las stout maridan muy bien con postres de chocolate y carnes ahumadas.'
    );
  }

  const summary = [
    beers.length
      ? `Encontré ${beers.length} cervezas que podrían gustarte.`
      : 'No encontré cervezas exactas con ese término.',
    places.length
      ? `También encontré ${places.length} lugares recomendados.`
      : 'No encontré lugares exactos con ese término.',
    ...tips,
  ].join(' ');

  const normalizedBeers = beers.map((beer) => {
    const plainBeer = beer.toObject ? beer.toObject() : beer;
    const { style, ...rest } = plainBeer;
    return {
      ...rest,
      beerStyle: style,
    };
  });

  return sendSuccess(res, {
    message: 'AI suggestions generated successfully',
    data: {
      answer: summary,
      beers: normalizedBeers,
      places,
    },
  });
});

/**
 * Get all chats for authenticated user
 */
export const getUserChats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { type } = req.query;
  const includeGlobalCommunity = !type || type === 'community';

  const filter = {
    participants: userId,
    archivedBy: { $ne: userId },
    globalRoomKey: { $ne: GLOBAL_COMMUNITY_ROOM_KEY },
  };

  if (type && ['community', 'b2b', 'ai'].includes(type)) {
    filter.chatType = type;
  }

  const [globalCommunityChat, chats] = await Promise.all([
    includeGlobalCommunity ? ensureGlobalCommunityChat() : null,
    populateChatQuery(Chat.find(filter)).sort({ updatedAt: -1 }),
  ]);

  const serializedChats = chats.map(serializeChat);

  if (globalCommunityChat) {
    serializedChats.unshift(serializeChat(globalCommunityChat));
  }

  return sendSuccess(res, {
    message: 'Chats retrieved successfully',
    data: serializedChats,
  });
});

/**
 * Get messages for a chat
 */
export const getChatMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 30);

  const chat = await Chat.findById(chatId);

  if (!chat || !canAccessChat(chat, userId)) {
    return sendError(res, {
      statusCode: 403,
      message: 'Access denied',
    });
  }

  const messageFilter = {
    chat: chatId,
    deletedFor: { $ne: userId },
  };

  const total = await Message.countDocuments(messageFilter);
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const offsetFromLatest = (page - 1) * limit;

  const messages =
    total > 0 && offsetFromLatest < total
      ? await populateMessageQuery(
          Message.find(messageFilter)
            .sort({ createdAt: 1 })
            .skip(Math.max(total - page * limit, 0))
            .limit(limit)
        )
      : [];

  return sendSuccess(res, {
    message: 'Messages retrieved successfully',
    data: messages.map(serializeMessage),
    meta: {
      page,
      limit,
      total,
      totalPages,
      order: 'asc',
      sortedBy: 'createdAt',
      paginationStrategy: 'latest-first',
    },
  });
});

/**
 * Mark chat as read
 */
export const markChatAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  await Message.updateMany(
    {
      chat: chatId,
      'readBy.user': { $ne: userId },
    },
    {
      $push: { readBy: { user: userId } },
    }
  );

  return sendSuccess(res, {
    message: 'Chat marked as read',
    data: {},
  });
});

/**
 * Archive chat
 */
export const archiveChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  await Chat.updateOne({ _id: chatId }, { $addToSet: { archivedBy: userId } });

  return sendSuccess(res, {
    message: 'Chat archived successfully',
    data: {},
  });
});

/**
 * Mute chat
 */
export const muteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  await Chat.updateOne({ _id: chatId }, { $addToSet: { mutedBy: userId } });

  return sendSuccess(res, {
    message: 'Chat muted successfully',
    data: {},
  });
});

/**
 * Unmute chat
 */
export const unmuteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  await Chat.updateOne({ _id: chatId }, { $pull: { mutedBy: userId } });

  return sendSuccess(res, {
    message: 'Chat unmuted successfully',
    data: {},
  });
});

/**
 * Soft delete message for user
 */
export const deleteMessageForUser = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  await Message.updateOne(
    { _id: messageId },
    { $addToSet: { deletedFor: userId } }
  );

  return sendSuccess(res, {
    message: 'Message hidden for user successfully',
    data: {},
  });
});
