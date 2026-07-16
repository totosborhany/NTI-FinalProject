import {
  userData,
  deleteUser,
  updateUser,
  getAllUsers as getAllUsersService,
  createUser as createUserService,
  getUserById as getUserByIdService,
  updateUserById as updateUserByIdService,
  deleteUserById as deleteUserByIdService,
  updateUserPassword
} from '../services/users.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { id } from 'zod/locales';
import {User} from "../models/users.js";
export const getMe = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const users = await userData(userId);
  if (!users) {
    return next(new AppError(404, 'User not found'));
  }

  res.status(200).json(ApiResponse.success('User fetched successfully', users));
});

export const deleteMe = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const done = await deleteUser(userId);
  if (!done) {
    return next(new AppError(404, 'sorry a problem occured'));
  }
  res.status(200).json(ApiResponse.success('User deleted successfully', null));
});

export const updateMe = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const data = req.body;
  if (!data) {
    return next(new AppError(404, 'you must provide data to update'));
  }
  if (data.password) {
    return next(new AppError(400, 'Password cannot be updated here'));
  }

  const updatedUser = await updateUser(userId, data,req.file);

  if (!updatedUser) {
    return next(new AppError(404, 'sorry a problem occured'));
  }

  res.status(201).json(ApiResponse.success('User updated successfully', updatedUser));
});

export const getAllUsers = catchAsync(async (req, res,next) => {
  const users = await getAllUsersService(req.query);
  res.status(200).json(ApiResponse.success('Users fetched successfully', users));
});

export const createUser = catchAsync(async (req, res, next) => {
  const user = await createUserService(req.body);
  if (!user) {
    return next(new AppError(400, 'User could not be created'));
  }

  res.status(201).json(ApiResponse.success('User created successfully', user));
});

export const getUserById = catchAsync(async (req, res, next) => {
  const user = await getUserByIdService(req.params.id);
  if (!user) {
    return next(new AppError(404, 'User not found'));
  }

  res.status(200).json(ApiResponse.success('User fetched successfully', user));
});

export const updateUserById = catchAsync(async (req, res, next) => {
  const user = await updateUserByIdService(req.params.id, req.body);
  if (!user) {
    return next(new AppError(404, 'User not found'));
  }

  res.status(200).json(ApiResponse.success('User updated successfully', user));
});

export const deleteUserById = catchAsync(async (req, res, next) => {
  const user = await deleteUserByIdService(req.params.id);
  if (!user) {
    return next(new AppError(404, 'User not found'));
  }

  res.status(200).json(ApiResponse.success('User deleted successfully', user));
});
export const updatePassword = catchAsync(async (req,res,next)=>{
  const {oldPassword,newPassword,confirmNewPassword} = req.body;
  const userId = req.user.id; 
  const changed = await  updateUserPassword(userId,oldPassword,newPassword,confirmNewPassword);
  if(!changed){
    return next(new AppError(400, 'sorry problem changing password'));
  }
return res.status(201).json(ApiResponse.success('password updated successfully'));
});