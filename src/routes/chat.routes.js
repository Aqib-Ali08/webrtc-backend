// import { SearchUserController } from "../controllers/search.controller.js";
import { getChats } from "../controllers/conversation.controller.js";
import authenticateToken from "../middlewares/authenticateToken.middleware.js";
import express from 'express';

const router = express.Router();


router.get('/getChats', authenticateToken, getChats);

export default router;