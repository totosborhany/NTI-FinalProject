import { invitationsService } from '../services/invitations.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const invitationsController = {
  placeholder: catchAsync(async (_req, res) => {
    const result = await invitationsService.placeholder();
    res.status(501).json(ApiResponse.fail(result.message));
  }),
};
