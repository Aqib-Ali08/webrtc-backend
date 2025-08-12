import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import errorMiddleware from './middlewares/error.middleware.js';
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import friendRoutes from "./routes/friend.routes.js"
import searchRoutes from "./routes/search.routes.js"
const app = express();

dotenv.config();

const allowedOrigins = [process.env.SOCKET_CLIENT_URL || 'http://localhost:5173'];

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/connect', friendRoutes);
app.use('/api/v1/search', searchRoutes);

app.use(errorMiddleware);

export default app;
