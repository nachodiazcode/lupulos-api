import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import config from './index.js';
import logger from '../utils/logger.js';
import { isTokenRevoked } from '../utils/tokenSecurity.js';
import { setChatRealtimeAdapter } from '../services/chatRealtime.service.js';

const userRoom = (userId) => `user:${userId}`;
const chatRoom = (chatId) => `chat:${chatId}`;

let ioInstance = null;

export const getIO = () => ioInstance;

const extractToken = (socket) => {
  const authToken = socket.handshake.auth?.token;
  if (authToken) return authToken;

  const header = socket.handshake.headers?.authorization;
  if (header?.startsWith('Bearer ')) return header.split(' ')[1];

  return null;
};

/**
 * Initialize socket.io on top of the given HTTP/HTTPS server.
 * Authenticates each connection with the same JWT used by the REST API,
 * joins every user to their personal room, and registers the chat realtime
 * adapter so controllers can push messages live.
 */
export const initRealtime = (server) => {
  const io = new Server(server, {
    cors: {
      origin: config.cors.origins,
      credentials: true,
    },
  });
  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) return next(new Error('Auth token missing'));

      if (await isTokenRevoked(token)) {
        return next(new Error('Token has been revoked'));
      }

      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const userId = decoded.id || decoded._id || decoded.userId;
      if (!userId) return next(new Error('Invalid token payload'));

      socket.user = { id: String(userId), role: decoded.role || 'user' };
      return next();
    } catch (error) {
      logger.warn(`Socket auth failed: ${error.message}`);
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    socket.join(userRoom(userId));
    logger.info(`Socket connected: ${socket.id} (user ${userId})`);

    socket.on('chat:join', (chatId) => {
      if (chatId) socket.join(chatRoom(String(chatId)));
    });

    socket.on('chat:leave', (chatId) => {
      if (chatId) socket.leave(chatRoom(String(chatId)));
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id} (user ${userId})`);
    });
  });

  // Wire the pluggable adapter consumed by chat.controller.js
  setChatRealtimeAdapter({
    emitChatMessageNew: async ({
      chatId,
      message,
      participantIds = [],
      senderId,
      isGlobal,
    }) => {
      if (!chatId || !message) return;

      const room = chatRoom(String(chatId));

      // Live append for anyone currently viewing this conversation.
      io.to(room).emit('chat:message:new', { chatId: String(chatId), message });

      // Inbox/badge bump for direct-chat participants who may not be in the room.
      if (!isGlobal) {
        for (const participantId of participantIds) {
          if (String(participantId) === String(senderId)) continue;
          io.to(userRoom(String(participantId))).emit('chat:inbox:update', {
            chatId: String(chatId),
            message,
          });
        }
      }
    },
  });

  logger.info('Realtime (socket.io) initialized');
  return io;
};

export default { initRealtime, getIO };
