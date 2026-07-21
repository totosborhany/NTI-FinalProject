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
  updatePassword,
  forgotPassword,
  resetPassword
} from '../controllers/users.controller.js';
import { protect } from '../middlewares/authenticate.js';
import { authorizedTo } from '../middlewares/authorize.js';
import {upload} from "../middlewares/upload.js";
const router = express.Router();
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);
router.route('/').get(protect, authorizedTo('admin') ,getAllUsers);

router.route('/me').get(protect, getMe).patch(protect,  upload.single("avatar"),updateMe).delete(protect, deleteMe);
router.route('/password').patch(protect, updatePassword);


router.route('/:id').get(protect, authorizedTo('admin'), getUserById).patch(protect, authorizedTo('admin'), updateUserById).delete(protect, authorizedTo('admin'), deleteUserById);

export default router;