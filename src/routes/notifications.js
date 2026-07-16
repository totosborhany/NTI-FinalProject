import express from 'express';
import { notificationsController } from '../controllers/notifications.controller.js';
import { protect } from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/', protect, notificationsController.getNotifications);
router.patch('/:notificationId/read', protect, notificationsController.markAsRead);

export default router;
