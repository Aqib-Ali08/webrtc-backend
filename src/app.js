import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import errorMiddleware from './middlewares/error.middleware.js';
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import friendRoutes from "./routes/friend.routes.js"
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/connect', friendRoutes);  

app.use(errorMiddleware);

export default app;
