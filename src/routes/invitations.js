import express from 'express';
import { createInvitation, myInvitations, editInvitation, deleteInvitation ,reactToinvitation} from '../controllers/invitations.controller.js';
import { protect } from '../middlewares/authenticate.js';
import { authorizeProjectTo } from '../middlewares/authorize.project.js';

const router = express.Router();

router.use(protect);
router.post('/:projectId', authorizeProjectTo('ADMIN', 'OWNER'), createInvitation);
router.patch('/:projectId/:invitationId', authorizeProjectTo('ADMIN', 'OWNER'), editInvitation);
router.delete('/:projectId/:invitationId', authorizeProjectTo('ADMIN', 'OWNER'), deleteInvitation);
router.patch("/:invitationId",reactToinvitation);
router.get('/', myInvitations);

export default router;
