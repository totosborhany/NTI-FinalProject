import { getAttachmentsByTaskService, createAttachmentService, deleteAttachmentService } from '../services/attachments.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getAttachmentsByTask = catchAsync(async (req, res, next) => {
  const attachments = await getAttachmentsByTaskService(req.params.taskId);
  return res.status(200).json(ApiResponse.success('Attachments retrieved successfully', attachments));
});

export const createAttachment = catchAsync(async (req, res, next) => {
  const attachment = await createAttachmentService(req.params.taskId, req.file, req.user.id);
  if (!attachment) {
    return next(new AppError(400, 'Could not store attachment'));
  }
  return res.status(201).json(ApiResponse.success('Attachment stored successfully', attachment));
});

export const deleteAttachment = catchAsync(async (req, res, next) => {
  await deleteAttachmentService(req.params.attachmentId);
  return res.status(200).json(ApiResponse.success('Attachment deleted successfully', null));
});
