import express from 'express';
import { notificationsController } from '../controllers/notifications.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/', authenticate, notificationsController.getNotifications);
router.patch('/:notificationId/read', authenticate, notificationsController.markAsRead);

export default router;
