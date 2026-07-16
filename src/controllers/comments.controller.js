import { getCommentsByTaskService, createCommentService, updateCommentService, deleteCommentService } from '../services/comments.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getCommentsByTask = catchAsync(async (req, res, next) => {
  const comments = await getCommentsByTaskService(req.params.taskId);
  return res.status(200).json(ApiResponse.success('Comments retrieved successfully', comments));
});

export const createComment = catchAsync(async (req, res, next) => {
  const comment = await createCommentService(req.params.taskId, req.body, req.user.id);
  if (!comment) {
    return next(new AppError(400, 'Could not create comment'));
  }
  return res.status(201).json(ApiResponse.success('Comment created successfully', comment));
});

export const updateComment = catchAsync(async (req, res, next) => {
  const comment = await updateCommentService(req.params.commentId, req.body,req.user.id);
  return res.status(200).json(ApiResponse.success('Comment updated successfully', comment));
});

export const deleteComment = catchAsync(async (req, res, next) => {
  await deleteCommentService(req.params.commentId,req.user.id);
  return res.status(200).json(ApiResponse.success('Comment deleted successfully', null));
});
