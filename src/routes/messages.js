import express from 'express';
import { messagesController } from '../controllers/messages.controller.js';

const router = express.Router();

router.use('/', messagesController.placeholder);

export default router;
