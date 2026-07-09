import { messagesService } from '../services/messages.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const messagesController = {
  placeholder: catchAsync(async (_req, res) => {
    const result = await messagesService.placeholder();
    res.status(501).json(ApiResponse.fail(result.message));
  }),
};
