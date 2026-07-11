import { Attachment } from '../models/attachments.js';
import { Task } from '../models/tasks.js';
import { AppError } from '../utils/AppError.js';

const populateAttachment = async (attachment) => {
  await attachment.populate('uploadedBy');
  return attachment;
};

export const getAttachmentsByTaskService = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(404, 'task not found');
  }

  return await Attachment.find({ task: taskId }).populate('uploadedBy');
};

export const createAttachmentService = async (taskId, file, userId) => {
  if (!file) {
    throw new AppError(400, 'file is required');
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(404, 'task not found');
  }

  const fileName = file.filename || file.originalname;
  const url = file.path || file.location || '';
  const publicId = file.publicId || file.key || fileName;

  if (!url) {
    throw new AppError(400, 'file url is required');
  }

  const attachment = new Attachment({
    uploadedBy: userId,
    project: task.project,
    task: taskId,
    fileName,
    originalName: file.originalname || fileName,
    mimeType: file.mimetype,
    size: file.size,
    url,
    publicId,
  });

  await attachment.save();
  return await populateAttachment(attachment);
};

export const deleteAttachmentService = async (attachmentId) => {
  const attachment = await Attachment.findByIdAndDelete(attachmentId);
  if (!attachment) {
    throw new AppError(404, 'attachment not found');
  }

  return attachment;
};
