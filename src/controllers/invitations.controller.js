import { reactToinvitationService,sendInvitation, getMyInvitations, editInvitationService, deleteInvitationService } from '../services/invitations.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createInvitation = catchAsync(async (req, res, next) => {
  const { recieverEmail } = req.body;
  const projectId = req.params.projectId;
  if (!recieverEmail || !projectId) {
    return next(new AppError(400, 'sorry missing fieleds'));
  }

  const invitation = await sendInvitation(req.user.id, recieverEmail, projectId);
  if (!invitation) {
    return next(new AppError(400, 'sorry could send invitation'));
  }

  return res.status(200).json(ApiResponse.success('inviation made and sent', invitation));
});

export const editInvitation = catchAsync(async (req, res, next) => {
  const { projectId, invitationId } = req.params;
  const invitation = await editInvitationService(projectId, invitationId, req.body);

  if (!invitation) {
    return next(new AppError(400, 'sorry could not update invitation'));
  }

  return res.status(200).json(ApiResponse.success('invitation updated successfully', invitation));
});

export const deleteInvitation = catchAsync(async (req, res, next) => {
  const { projectId, invitationId } = req.params;
  const invitation = await deleteInvitationService(projectId, invitationId);

  if (!invitation) {
    return next(new AppError(400, 'sorry could not delete invitation'));
  }

  return res.status(204).json(ApiResponse.success('invitation deleted successfully'));
});

export const myInvitations = catchAsync(async (req, res,next) => {
  const userId = req.user.id;
  const [received, sent] = await getMyInvitations(userId);

  return res.status(200).json(
    ApiResponse.success('Invitations retrieved successfully', {
      received,
      sent,
    })
  );
});
export const reactToinvitation = catchAsync(async (req,res,next)=>{

  const {status}= req.body;
  const invitationId = req.params.invitationId;
  const reaction = await reactToinvitationService(req.user.id,invitationId,status)

});