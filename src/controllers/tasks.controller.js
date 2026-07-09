import { tasksService } from '../services/tasks.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const tasksController = {
  placeholder: catchAsync(async (_req, res) => {
    const result = await tasksService.placeholder();
    res.status(501).json(ApiResponse.fail(result.message));
  }),
};
