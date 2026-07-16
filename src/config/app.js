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
import notificationRouter from "../routes/notifications.js";
import  InvitationRouter  from '../routes/invitations.js';
import mongoSanitize  from "express-mongo-sanitize";
import rateLimit from 'express-rate-limit';
import { xss } from "express-xss-sanitizer";
import hpp from "hpp";
const app = express();
import { AppError } from '../utils/AppError.js';
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 100, 
  standardHeaders: 'draft-7', 
  legacyHeaders: false, 
  handler: (req, res, next) => {
    next(new AppError(429, 'Too many requests from this IP. Please try again in 15 minutes.'));
  }
});
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError(429, 'Too many login attempts. Please try again in 15 minutes.'));
  }
});
const parseCookies = (req, _res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;

  if (cookieHeader) {
    for (const cookie of cookieHeader.split(';')) {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (!name) continue;
      const value = valueParts.join('=');
      req.cookies[name] = value ? decodeURIComponent(value) : '';
     }
  }
  next();
};
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(xss());
app.use(compression());
app.use(express.json({limit:"10kb"}));
app.use(express.urlencoded({ extended: true }));
app.use(parseCookies);
app.use(hpp());
app.use((req, _res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.headers) mongoSanitize.sanitize(req.headers);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
});
app.use(morgan(process.env.ENVIRONMENT === 'production' ? 'combined' : 'dev'));
// app.use(cookie)
app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', data: null });
});
app.use('/api/v1/users', globalLimiter,usersRouter);
app.use('/api/v1/projects', globalLimiter, projectsRouter);
app.use('/api/v1/tasks',globalLimiter ,tasksRouter);
app.use('/api/v1/attachments', globalLimiter,attachmentsRouter);
app.use('/api/v1/comments', globalLimiter,commentsRouter);
app.use('/api/v1/auth',authLimiter ,authRouter);
app.use("/api/v1/invitations",globalLimiter,InvitationRouter)
app.use("/api/v1/notifications", globalLimiter,notificationRouter)
app.use(notFound);
app.use(errorHandler);
export default app;