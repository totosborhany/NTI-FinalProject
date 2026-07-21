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

   res.status(200).json(ApiResponse.success('inviation made and sent', invitation));
});

export const editInvitation = catchAsync(async (req, res, next) => {
  const { projectId, invitationId } = req.params;
  const invitation = await editInvitationService(projectId, invitationId, req.body);

  if (!invitation) {
    return next(new AppError(400, 'sorry could not update invitation'));
  }

   res.status(200).json(ApiResponse.success('invitation updated successfully', invitation));
});

export const deleteInvitation = catchAsync(async (req, res, next) => {
  const { projectId, invitationId } = req.params;
  const invitation = await deleteInvitationService(projectId, invitationId);

  if (!invitation) {
    return next(new AppError(400, 'sorry could not delete invitation'));
  }

   res.status(204).json(ApiResponse.success('invitation deleted successfully'));
});

export const myInvitations = catchAsync(async (req, res,next) => {
  const userId = req.user.id;
  const result = await getMyInvitations(userId,req.query);
  if(result.data.length === 0){
return res.status(200).json(ApiResponse.success('No invitations found',result.data,result.meta,result.summary));
  }
   res.status(200).json(
    ApiResponse.success('Invitations retrieved successfully',result.data,result.meta,result.summary)
  );
});
export const reactToinvitation = catchAsync(async (req,res,next)=>{

  const {status}= req.body;
  const invitationId = req.params.invitationId;
  const reaction = await reactToinvitationService(req.user.id,invitationId,status)
  res.status(200).json(ApiResponse.success("yiu have succesfully reacted to the invitaation",reaction));
});