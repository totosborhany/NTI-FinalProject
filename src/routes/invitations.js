import express from 'express';
import { invitationsController } from '../controllers/invitations.controller.js';

const router = express.Router();

router.use('/', invitationsController.placeholder);

export default router;
