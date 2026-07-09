import express from 'express';
import { notificationsController } from '../controllers/notifications.controller.js';

const router = express.Router();

router.use('/', notificationsController.placeholder);

export default router;
