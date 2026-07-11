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

const router = express.Router();

router.use(protect);

router.route('/').get(authorizedTo('admin'), getAllUsers).post(authorizedTo('admin'), createUser);

router.route('/me').get(getMe).patch(updateMe).delete(deleteMe).patch(updatePassword);
router.route('/password').patch(updatePassword);
//.post(forgotPassword);
router.route('/:id').get(authorizedTo('admin'), getUserById).patch(authorizedTo('admin'), updateUserById).delete(authorizedTo('admin'), deleteUserById);

export default router;