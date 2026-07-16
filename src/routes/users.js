import express from 'express';
import {
  getMe,
  deleteMe,
  updateMe,
  getAllUsers,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
  updatePassword
} from '../controllers/users.controller.js';
import { protect } from '../middlewares/authenticate.js';
import { authorizedTo } from '../middlewares/authorize.js';
import {upload} from "../middlewares/upload.js";
const router = express.Router();

router.route('/').get(protect, authorizedTo('admin') ,getAllUsers).post(protect, authorizedTo('admin'), createUser);

router.route('/me').get(protect, getMe).patch(protect,  upload.single("avatar"),updateMe).delete(protect, deleteMe);
router.route('/password').patch(protect, updatePassword);
//.post(forgotPassword);
router.route('/:id').get(protect, authorizedTo('admin'), getUserById).patch(protect, authorizedTo('admin'), updateUserById).delete(protect, authorizedTo('admin'), deleteUserById);

export default router;