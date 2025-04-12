// src/routes/index.js
import express from 'express';

const router = express.Router();

// Example route
router.get('/', (req, res) => {
  res.send('Welcome to the WebRTC backend API!');
});

export default router;
