import express from 'express';
import { createInvitation, myInvitations, editInvitation, deleteInvitation ,reactToinvitation} from '../controllers/invitations.controller.js';
import { protect } from '../middlewares/authenticate.js';
import { authorizeProjectTo } from '../middlewares/authorize.project.js';

const router = express.Router();

router.post('/:projectId', protect, authorizeProjectTo('ADMIN', 'OWNER'), createInvitation);
router.patch('/:projectId/:invitationId', protect, authorizeProjectTo('ADMIN', 'OWNER'), editInvitation);
router.delete('/:projectId/:invitationId', protect, authorizeProjectTo('ADMIN', 'OWNER'), deleteInvitation);
router.patch('/:invitationId', protect, reactToinvitation);
router.get('/', protect, myInvitations);

export default router;
