import express from 'express';
import { getAllMyProjects, createProject, getProjectById, updateProject, deleteProject, addMember, removeMember, changeMemberRole, archiveProject, restoreProject } from '../controllers/projects.controller.js';
import { protect } from '../middlewares/authenticate.js';
import{authorizeProjectTo} from "../middlewares/authorize.project.js";
import { sendInvitation } from '../services/invitations.service.js';
const router = express.Router();
router.use(protect);
router.route('/').get(getAllMyProjects).post(createProject);
router.route('/:projectId').get(getProjectById).patch(updateProject).delete(authorizeProjectTo("OWNER"),deleteProject);
router.delete('/:projectId/members/:userId', authorizeProjectTo("OWNER"),removeMember);
router.patch('/:projectId/members/:userId/role',authorizeProjectTo("ADMIN","OWNER"), changeMemberRole);
router.patch('/:projectId/archive', authorizeProjectTo("ADMIN","OWNER"),archiveProject);
router.patch('/:projectId/restore', authorizeProjectTo("ADMIN","OWNER"),restoreProject);
//authorizedProjectTo ["OWNER", "ADMIN", "MEMBER"];
export default router;
// | Action              | Owner | Admin | Member |
// | ------------------- | :---: | :---: | :----: |
// | View project        |   ✅   |   ✅   |    ✅   |//here✅
// | Create tasks        |   ✅   |   ✅   |    ✅   |//not here
// | Edit tasks          |   ✅   |   ✅   |    ✅   |//not here
// | Comment             |   ✅   |   ✅   |    ✅   |//not here
// | Upload files        |   ✅   |   ✅   |    ✅   |//not here
// | Invite members      |   ✅   |   ✅   |    ❌   |//not here
// | Remove members      |   ✅   |   ✅   |    ❌   |//here✅
// | Change member roles |   ✅   |   ❌   |    ❌   |//here✅
// | Delete project      |   ✅   |   ❌   |    ❌   |
// | Transfer ownership  |   ✅   |   ❌   |    ❌   |