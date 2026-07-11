import express from 'express';
import { protect } from '../middlewares/authenticate.js';
import { getCommentsByTask, createComment, updateComment, deleteComment } from '../controllers/comments.controller.js';

const router = express.Router();

router.use(protect);

router.route('/tasks/:taskId/comments').get(getCommentsByTask).post(createComment);
router.route('/comments/:commentId').patch(updateComment).delete(deleteComment);

export default router;
