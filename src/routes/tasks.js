import express from 'express';
import { tasksController } from '../controllers/tasks.controller.js';

const router = express.Router();

router.use('/', tasksController.placeholder);
export default router;