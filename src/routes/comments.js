import express from 'express';
import { protect } from '../middlewares/authenticate.js';
import { getCommentsByTask, createComment, deleteComment } from '../controllers/comments.controller.js';
import { upload } from '../middlewares/upload.js';
const router = express.Router();

router.route('/:commentId').delete(protect, deleteComment);

export default router;
