import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import validateRequest from '../middlewares/validateRequest.js';
import { chatValidation } from '../validations/requestSchemas.js';
import {
  getUserChats,
  getChatMessages,
  createOrGetChat,
  sendMessage,
  aiAssistantQuery,
  getGlobalCommunityRoom,
  getUnreadCount,
  markChatAsRead,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", validateRequest(chatValidation.listChats), getUserChats);
router.get("/unread-count", getUnreadCount);
router.get("/global/community", getGlobalCommunityRoom);
router.get(
  "/messages/:chatId",
  validateRequest(chatValidation.messageList),
  getChatMessages
);

router.post("/:chatId/read", markChatAsRead);

router.post(
  "/direct",
  validateRequest(chatValidation.createChat),
  createOrGetChat
);

router.post(
  "/:chatId/messages",
  validateRequest(chatValidation.sendMessage),
  sendMessage
);

router.post(
  "/ai/query",
  validateRequest(chatValidation.aiQuery),
  aiAssistantQuery
);

export default router;
