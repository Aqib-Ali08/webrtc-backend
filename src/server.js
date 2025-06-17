import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.config.js';
// import { registerSocketEvents } from './sockets/index.socket.js';
import { setupSocketServer } from './config/socket.config.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    setupSocketServer(server);
    // registerSocketEvents();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
