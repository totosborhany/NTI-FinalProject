import { User } from '../models/users.js';
import Bcrypt from "bcrypt";
export const userData = async (id) => {
  return await User.findById(id).select('-password').lean().exec();
};

export const deleteUser = async (id) => {
  return await User.findByIdAndUpdate(id, { isActive: false }, { new: true }).select('-password').lean().exec();
};

export const updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-password').lean().exec();
};

export const getAllUsers = async () => {
  return await User.find({ isActive: true }).select('-password').lean().exec();
};

export const createUser = async (data) => {
  const newUser = await User.create(data);
  return await User.findById(newUser._id).select('-password').lean().exec();
};

export const getUserById = async (id) => {
  return await User.findById(id).select('-password').lean().exec();
};

export const updateUserById = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-password').lean().exec();
};

export const deleteUserById = async (id) => {
  return await User.findByIdAndUpdate(id, { isActive: false }, { new: true }).select('-password').lean().exec();
};
export const updateUserPassword = async (id, oldpassword, newPassword, confirmNewPassword) => {
  const user = await User.findById(id).select('+password');
  if (!user) return false;

  const isMatch = await user.comparePassword(oldpassword);
  if (!isMatch) return false;

  if (newPassword !== confirmNewPassword) {
    return false; // Better alternative: throw a specific validation error
  }

  user.password = newPassword; 
  
  await user.save();
  return true;
};
