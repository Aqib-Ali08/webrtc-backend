import express from 'express';
import { login, refreshAccessToken, register } from '../controllers/auth.controllers.js';
import authenticateToken from '../middlewares/authenticateToken.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refreshToken', refreshAccessToken);

router.get('/protected', authenticateToken, (req, res) => {
  res.send(`${req.user.username} is a valid user`);
});

export default router;
