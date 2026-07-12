import { notificationsService } from '../services/notifications.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const notificationsController = {
  getNotifications: catchAsync(async (req, res) => {
    const notifications = await notificationsService.getUserNotifications(req.user.id);
    res.status(200).json(ApiResponse.success('Notifications retrieved successfully', notifications));
  }),

  markAsRead: catchAsync(async (req, res) => {
    const notification = await notificationsService.markAsRead(req.params.notificationId, req.user.id);

    if (!notification) {
      return res.status(404).json(ApiResponse.fail('Notification not found'));
    }

    return res.status(200).json(ApiResponse.success('Notification marked as read', notification));
  }),
};
