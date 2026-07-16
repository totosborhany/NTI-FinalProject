import express from 'express';
import { protect } from '../middlewares/authenticate.js';
import { authorizeProjectTo } from '../middlewares/authorize.project.js';
import { authorizeTaskTo } from '../middlewares/authorize.task.js';
import { getTasksByProject, createTask,getAllTasks, getTaskById, updateTask, deleteTask } from '../controllers/tasks.controller.js';
import {getCommentsByTask, createComment} from "../controllers/comments.controller.js";
import { getAttachmentsByTask, createAttachment, deleteAttachment } from '../controllers/attachments.controller.js';
import {upload} from "../middlewares/upload.js";
const router = express.Router();

router.route("/").get(protect,getAllTasks)
router.route('/:taskId')
  .get(protect, authorizeTaskTo('OWNER', 'ADMIN','MEMBER'), getTaskById)
  .patch(protect, authorizeTaskTo('OWNER', 'ADMIN'), updateTask)
  .delete(protect, authorizeTaskTo('OWNER', 'ADMIN'), deleteTask);

router.route('/:taskId/comments').
get(protect,authorizeTaskTo('OWNER', 'ADMIN','MEMBER'), getCommentsByTask).
post(protect,authorizeTaskTo('OWNER', 'ADMIN','MEMBER') ,createComment);

router.route('/:taskId/attachments').get(protect, authorizeTaskTo('OWNER', 'ADMIN','MEMBER'),getAttachmentsByTask).post(protect,authorizeTaskTo('OWNER', 'ADMIN','MEMBER') ,upload.single('file'),createAttachment);
router.delete("/:taskId/attachments/:attachmentId",protect,authorizeTaskTo('OWNER', 'ADMIN','MEMBER'),upload.single('file') ,deleteAttachment)
export default router;