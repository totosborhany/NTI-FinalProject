import express from 'express';
import { protect } from '../middlewares/authenticate.js';
import { getAttachmentsByTask, createAttachment, deleteAttachment } from '../controllers/attachments.controller.js';

const router = express.Router();

router.use(protect);

router.route('/tasks/:taskId/attachments').get(getAttachmentsByTask).post(createAttachment);
router.route('/attachments/:attachmentId').delete(deleteAttachment);

export default router;