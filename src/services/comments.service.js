import { Comment } from '../models/comments.js';
import { Task } from '../models/tasks.js';
import { AppError } from '../utils/AppError.js';

const populateComment = async (comment) => {
  await comment.populate('author');
  return comment;
};

export const getCommentsByTaskService = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(404, 'task not found');
  }

  return await Comment.find({ task: taskId }).populate('author');
};

export const createCommentService = async (taskId, data, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(404, 'task not found');
  }

  if (!data.content) {
    throw new AppError(400, 'comment content is required');
  }

  const comment = new Comment({
    task: taskId,
    author: userId,
    content: data.content,
  });

  await comment.save();
  return await populateComment(comment);
};

export const updateCommentService = async (commentId, data,userId) => {
  const comment = await Comment.findById(commentId);
  if(userId.toString()!==comment.author.toString()){
    throw new AppError(403, 'not your comment');

  }
  if (!comment) {
    throw new AppError(404, 'comment not found');
  }

  if (!data.content) {
    throw new AppError(400, 'comment content is required');
  }

  comment.content = data.content;
  comment.edited = true;
  comment.editedAt = new Date();

  await comment.save();
  return await populateComment(comment);
};

export const deleteCommentService = async (commentId,userId) => {
  const comment = await Comment.findByIdAndDelete(commentId);
  if(userId.toString()!==comment.author.toString()){
    throw new AppError(403, 'not your comment');

  }
  if (!comment) {
    throw new AppError(404, 'comment not found');
  }

  return comment;
};
