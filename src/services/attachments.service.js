import { Attachment } from '../models/attachments.js';
import { Task } from '../models/tasks.js';
import { AppError } from '../utils/AppError.js';
import {uploadToCloudinary} from "../utils/uploadToCloudinary.js";
import {imagekit} from "../config/cloudinary.js";
import { ActivityLog } from '../models/logs.js';
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
    throw new AppError(400, "file is required");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new AppError(404, "task not found");
  }

  let attachment;

  try {
    const uploaded = await uploadToCloudinary(file);

    const fileName = file.filename || file.originalname;

    attachment = new Attachment({
      uploadedBy: userId,
      project: task.project,
      task: taskId,
      fileName,
      originalName: file.originalname || fileName,
      mimeType: file.mimetype || uploaded.resource_type,
      size: uploaded.bytes,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
    });

    await attachment.save();

    task.attachments.push(attachment._id);
  } catch (err) {
    console.error(err);
    throw new AppError(500, "File upload failed");
  }

  await Promise.all([
    task.save(),
    ActivityLog.create({
      project: task.project,
      actor: userId,
      type: "ATTACHMENT_UPLOADED",
      entityType: "Attachment",
      entityId: attachment._id,
      message: `Attachment "${attachment.originalName}" has been uploaded to task "${task.title}".`,
    }),
  ]);

  return await populateAttachment(attachment);
};
export const deleteAttachmentService = async (attachmentId) => {
  const attachment = await Attachment.findById(attachmentId);

  if (!attachment) {
    throw new AppError(404, 'attachment not found');
  }


  await Promise.all([imagekit.deleteFile(attachment.publicId),

Task.findByIdAndUpdate(
    attachment.task,
    {
      $pull: {
        attachments: attachment._id,
      },
    }
  ),
  attachment.deleteOne(),
ActivityLog.create({
    project: attachment.project,
    actor: attachment.uploadedBy,
    type: "ATTACHMENT_DELETED",
    entityType: "Attachment",
    entityId: attachment._id,
    message: `Attachment ${attachment.originalName} was deleted from task ${attachment.task}.`,
  })
]);

  return attachment;
};