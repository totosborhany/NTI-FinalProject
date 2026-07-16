import { Attachment } from '../models/attachments.js';
import { Task } from '../models/tasks.js';
import { AppError } from '../utils/AppError.js';
import {uploadToCloudinary} from "../utils/uploadToCloudinary.js";
import {imagekit} from "../config/cloudinary.js";
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
  
  const uploaded = await uploadToCloudinary(file);

  const fileName = file.filename || file.originalname;
  const url = uploaded.secure_url;

  if (!url) {
    throw new AppError(400, 'file url is required');
  }

  const attachment = new Attachment({
    uploadedBy: userId,
    project: task.project,
    task: taskId,
    fileName,
    originalName: file.originalname || fileName,
    
    // ⚡️ ALWAYS use Multer's MIME type first to satisfy your Schema validation
    mimeType: file.mimetype || uploaded.resource_type, 
    
    size: uploaded.bytes,
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
  });

  await attachment.save();
  return await populateAttachment(attachment);
};
export const deleteAttachmentService = async (attachmentId) => {
  const attachment = await Attachment.findById(attachmentId);

  if (!attachment) {
    throw new AppError(404, 'attachment not found');
  }

  // ⚡️ Correct ImageKit delete syntax:
  await imagekit.deleteFile(attachment.publicId);

  await Task.findByIdAndUpdate(
    attachment.task,
    {
      $pull: {
        attachments: attachment._id,
      },
    }
  );

  await attachment.deleteOne();

  return attachment;
};