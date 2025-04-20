import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js'; // make sure this file is ESM too

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);


    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
