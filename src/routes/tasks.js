import express from 'express';
import { protect } from '../middlewares/authenticate.js';
import { authorizeProjectTo } from '../middlewares/authorize.project.js';
import { authorizeTaskTo } from '../middlewares/authorize.task.js';
import { getTasksByProject, createTask, getTaskById, updateTask, deleteTask } from '../controllers/tasks.controller.js';

const router = express.Router();

router.use(protect);

router
  .route('/projects/:projectId/tasks')
  .get(authorizeProjectTo('OWNER', 'ADMIN', 'MEMBER'), getTasksByProject)
  .post(authorizeProjectTo('OWNER', 'ADMIN', 'MEMBER'), createTask);

router.route('/tasks/:taskId')
  .get(authorizeTaskTo(), getTaskById)
  .patch(authorizeTaskTo(), updateTask)
  .delete(authorizeTaskTo('OWNER', 'ADMIN'), deleteTask);

export default router;