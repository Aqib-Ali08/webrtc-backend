import express from 'express';
import { login, refreshAccessToken, register } from '../controllers/auth.controllers.js';
import authenticateToken from '../middlewares/authenticateToken.middleware.js';



const router = express.Router();

// Register route
router.post('/auth/register', register);

// Login route
router.post('/auth/login', login);
// Refresh Token
router.post('/auth/refreshToken', refreshAccessToken);

// Protected route
router.get('/auth/protected', authenticateToken, (req, res) => {
  res.send(`${req.user.username} is a valid user`);
});

export default router;
