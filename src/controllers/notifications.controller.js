import { notificationsService } from '../services/notifications.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const notificationsController = {
  getNotifications: catchAsync(async (req, res,next) => {
    const result = await notificationsService.getUserNotifications(req.query,req.user.id);
    if(result.data.length === 0){
return next(new AppError(404,"sorry couldnt find notificaions"))
    }

    res.status(200).json(ApiResponse.success('Notifications retrieved successfully', result.data, result.meta, result.summary));
  }),

  markAsRead: catchAsync(async (req, res) => {
    const notification = await notificationsService.markAsRead(req.params.notificationId, req.user.id);

    if (!notification) {
      return res.status(404).json(ApiResponse.fail('Notification not found'));
    }

    return res.status(200).json(ApiResponse.success('Notification marked as read', notification));
  }),
};
