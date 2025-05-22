import express from "express";
import { getUserChats, getChatMessages } from "../controllers/chatController.js";

const router = express.Router();

router.get("/:userId", getUserChats);
router.get("/messages/:chatId", getChatMessages);

export default router;
