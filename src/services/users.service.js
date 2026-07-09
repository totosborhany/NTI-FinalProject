import { User } from '../models/users.js';

export const userData = async (id) => {
  return await User.findById(id).select('-password').lean().exec();
};

export const deleteUser = async (id) => {
  return await User.findByIdAndUpdate(id, { active: false }, { new: true }).select('-password').lean().exec();
};

export const updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-password').lean().exec();
};

export const getAllUsers = async () => {
  return await User.find({ active: true }).select('-password').lean().exec();
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
  return await User.findByIdAndUpdate(id, { active: false }, { new: true }).select('-password').lean().exec();
};