import { Comment } from '../models/comments.js';
import { Task } from '../models/tasks.js';
import { AppError } from '../utils/AppError.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';
import { Attachment } from '../models/attachments.js';
import {imagekit} from "../config/cloudinary.js";
import { ActivityLog } from '../models/logs.js';
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

export const createCommentService = async (taskId, data, userId,file) => {
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
 
if(file){
  try{
  const uploaded = await uploadToCloudinary(file);
    const attachment = new Attachment({
      uploadedBy: userId,
      project: task.project,
      task: taskId,
      fileName: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
    });
    await attachment.save();
    comment.commentAttachments.push(attachment._id);
}catch(err){
  throw new AppError(500,`file upload failed: ${err.message}`);
}


  }

    await Promise.all([
comment.save(),
 ActivityLog.create({
    project: task.project,
    actor: userId,
    type: "COMMENT_CREATED",
    entityType: "Comment",
    entityId: comment._id,
    message: `Comment  was created on task "${task.title}"`,
  })
    ]);
     task.comments.push(comment._id);
  await task.save();
  return  populateComment(comment);
};


// export const updateCommentService = async (commentId, data,userId,file) => {
//   const comment = await Comment.findById(commentId);
//   if(userId.toString()!==comment.author.toString()){
//     throw new AppError(403, 'not your comment');

//   }
//   if (!comment) {
//     throw new AppError(404, 'comment not found');
//   }

//   if (!data.content) {
//     throw new AppError(400, 'comment content is required');
//   }

//   comment.content = data.content;
//   comment.edited = true;
//   comment.editedAt = new Date();

//   await comment.save();
//   return await populateComment(comment);
// };

export const deleteCommentService = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  const task = await Task.findById(comment.task).lean();
  if (!comment) {
    throw new AppError(404, "Comment not found");
  }


  if (comment.author.toString() !== userId.toString()) {
    throw new AppError(403, "You can only delete your own comment");
  }
const attachments = await Attachment.find({ comment: commentId });

for (const attachment of attachments) {
    await imagekit.deleteFile(attachment.publicId);

}

await Promise.all([ Attachment.deleteMany({ comment: commentId }),comment.deleteOne(),
  ActivityLog.create({
    project: task.project,
    actor: userId,
    type: "COMMENT_DELETED",
    entityType: "Comment",
    entityId: comment._id,
    message: `Comment  was deleted from task "${task.title}"`,
  })
]);


  return comment;
};