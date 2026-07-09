import { notificationsService } from '../services/notifications.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const notificationsController = {
  placeholder: catchAsync(async (_req, res) => {
    const result = await notificationsService.placeholder();
    res.status(501).json(ApiResponse.fail(result.message));
  }),
};
