import express from 'express';
import { commentsController } from '../controllers/comments.controller.js';

const router = express.Router();

router.use('/', commentsController.placeholder);

export default router;
