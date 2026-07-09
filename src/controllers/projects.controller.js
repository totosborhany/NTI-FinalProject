import { projectsService } from '../services/projects.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const projectsController = {
  placeholder: catchAsync(async (_req, res) => {
    const result = await projectsService.placeholder();
    res.status(501).json(ApiResponse.fail(result.message));
  }),
};
