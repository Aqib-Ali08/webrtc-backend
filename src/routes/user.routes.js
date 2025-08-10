import express from 'express';
import { list_connected_users, list_other_users, list_recieved_requests } from '../controllers/user.controller.js';
import authenticateToken from '../middlewares/authenticateToken.middleware.js';

const router = express.Router();

// router.get('/getAllUsers', authenticateToken, getAllUsers);
router.get('/list_other_users', authenticateToken, list_other_users);
router.get('/list_recieved_requests', authenticateToken, list_recieved_requests);
router.get('/list_connected_users', authenticateToken, list_connected_users);

export default router;
