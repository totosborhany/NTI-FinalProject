import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../config.env');
dotenv.config({ path: envPath });
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFound } from '../middlewares/index.js';
import attachmentsRouter from '../routes/attachments.js';
import commentsRouter from '../routes/comments.js';
import projectsRouter from '../routes/projects.js';
import tasksRouter from '../routes/tasks.js';
import usersRouter from '../routes/users.js';
import authRouter from "../routes/auth.router.js";
const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.ENVIRONMENT === 'production' ? 'combined' : 'dev'));
// app.use(cookie)
app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', data: null });
});

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1', tasksRouter);
app.use('/api/v1', attachmentsRouter);
app.use('/api/v1', commentsRouter);
app.use('/api/v1/auth', authRouter);
app.use((err, req, res, next) => {
 res.status(err.statusCode).json({
   status: err.status,
   message: err.message
 });
});
app.use(notFound);
app.use(errorHandler);







export default app;