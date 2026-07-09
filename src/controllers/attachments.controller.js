import { attachmentsService } from '../services/attachments.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const attachmentsController = {
  placeholder: catchAsync(async (_req, res) => {
    const result = await attachmentsService.placeholder();
    res.status(501).json(ApiResponse.fail(result.message));
  }),
};
