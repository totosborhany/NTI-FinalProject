import express from 'express';
import { protect } from '../middlewares/authenticate.js';
import { deleteAttachment } from '../controllers/attachments.controller.js';
import {authorizeTaskTo} from "../middlewares/authorize.task.js";
import {upload} from '../middlewares/upload.js';
const router = express.Router();


export default router;