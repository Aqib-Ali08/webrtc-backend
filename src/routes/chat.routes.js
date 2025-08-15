// import { SearchUserController } from "../controllers/search.controller.js";
import { get_users_for_chats, get_users_chat_history } from "../controllers/conversation.controller.js";
import authenticateToken from "../middlewares/authenticateToken.middleware.js";
import express from 'express';

const router = express.Router();


router.get('/get_users_for_chats', authenticateToken, get_users_for_chats);
router.get('/get_users_chat_history', authenticateToken, get_users_chat_history);

export default router;