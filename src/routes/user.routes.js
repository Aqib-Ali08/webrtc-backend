import express from 'express';
import { getAllUsers } from '../controllers/user.controller.js';
import authenticateToken from '../middlewares/authenticateToken.middleware.js';

const router = express.Router();

router.get('/getAllUsers', authenticateToken, getAllUsers);

export default router;
