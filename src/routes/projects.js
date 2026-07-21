import express from 'express';
import { getAllMembers,getAllMyProjects, createProject, getProjectById, updateProject, deleteProject, addMember, removeMember, changeMemberRole, archiveProject, restoreProject } from '../controllers/projects.controller.js';
import { protect } from '../middlewares/authenticate.js';
import{authorizeProjectTo} from "../middlewares/authorize.project.js";
import { sendInvitation } from '../services/invitations.service.js';
import { getTasksByProject, createTask} from '../controllers/tasks.controller.js';

const router = express.Router();
router.route('/').get(protect, getAllMyProjects).post(protect, createProject);
router.route('/:projectId').get(protect, authorizeProjectTo("OWNER","ADMIN","MEMBER"),getProjectById).patch(protect, updateProject).delete(protect, authorizeProjectTo("OWNER"),deleteProject);
router.delete('/:projectId/members/:userId', protect, authorizeProjectTo("OWNER"),removeMember);
router.get('/:projectId/members/',protect,authorizeProjectTo("OWNER","ADMIN","MEMBER"),getAllMembers);
router.patch('/:projectId/members/:userId/role', protect, authorizeProjectTo("ADMIN","OWNER"), changeMemberRole);
// router.patch('/:projectId/archive', protect, authorizeProjectTo("ADMIN","OWNER"),archiveProject);
// router.patch('/:projectId/restore', protect, authorizeProjectTo("ADMIN","OWNER"),restoreProject);
router
  .route('/:projectId/tasks')
  .get(protect, authorizeProjectTo('OWNER', 'ADMIN', 'MEMBER'), getTasksByProject)
  .post(protect, authorizeProjectTo('OWNER', 'ADMIN', 'MEMBER'), createTask);
// router.get('/logs',protect, authorizeProjectTo("OWNER","ADMIN","MEMBER"),seeLogs);
export default router;
