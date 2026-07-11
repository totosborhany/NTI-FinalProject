import express from 'express';
import { protect } from '../middlewares/authenticate.js';
import { authorizeProjectTo } from '../middlewares/authorize.project.js';
import { getTasksByProject, createTask, getTaskById, updateTask, deleteTask } from '../controllers/tasks.controller.js';

const router = express.Router();

router.use(protect);

router
  .route('/projects/:projectId/tasks')
  .get(authorizeProjectTo('OWNER', 'ADMIN', 'MEMBER'), getTasksByProject)
  .post(authorizeProjectTo('OWNER', 'ADMIN', 'MEMBER'), createTask);

router.route('/tasks/:taskId').get(getTaskById).patch(updateTask).delete(deleteTask);

export default router;