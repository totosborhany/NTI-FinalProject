import { commentsService } from '../services/comments.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const commentsController = {
  placeholder: catchAsync(async (_req, res) => {
    const result = await commentsService.placeholder();
    res.status(501).json(ApiResponse.fail(result.message));
  }),
};
