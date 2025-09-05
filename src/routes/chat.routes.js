// import { SearchUserController } from "../controllers/search.controller.js";
import { get_users_for_chats, get_users_chat_history, toggleChatBlockUnblock, ClearChatHistoryController, deleteMessage, get_user_block_status } from "../controllers/conversation.controller.js";
import authenticateToken from "../middlewares/authenticateToken.middleware.js";
import express from 'express';

const router = express.Router();


router.get('/get_users_for_chats', authenticateToken, get_users_for_chats);
router.get('/get_users_chat_history', authenticateToken, get_users_chat_history);
router.get('/get_users_block_status', authenticateToken, get_user_block_status);
router.post('/toggle_chat_block_unblock', authenticateToken, toggleChatBlockUnblock);
router.post('/clear_chat_history', authenticateToken, ClearChatHistoryController);
router.post('/delete_message', authenticateToken, deleteMessage);
export default router;