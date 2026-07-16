import express from 'express';
import { protect } from '../middlewares/authenticate.js';
import { getCommentsByTask, createComment, updateComment, deleteComment } from '../controllers/comments.controller.js';

const router = express.Router();

router.route('/:commentId').patch(protect, updateComment).delete(protect, deleteComment);

export default router;
