import { SearchUserController } from "../controllers/search.controller.js";
import authenticateToken from "../middlewares/authenticateToken.middleware.js";
import express from 'express';

const router = express.Router();


router.get('/searchUser', authenticateToken, SearchUserController);

export default router;