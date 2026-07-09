import express from 'express';
import { projectsController } from '../controllers/projects.controller.js';

const router = express.Router();

router.use('/', projectsController.placeholder);

export default router;