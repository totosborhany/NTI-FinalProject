import { User } from '../models/users.js';
import { AppError } from '../utils/AppError.js';
import {imagekit} from "../config/cloudinary.js";
import {Pagination} from  "../utils/pagination.js";
import {uploadToCloudinary} from "../utils/uploadToCloudinary.js";
export const userData = async (id) => {
  return await User.findById(id).select('-password').lean().exec();
};

export const deleteUser = async (id) => {
  return await User.findByIdAndUpdate(id, { isActive: false }, { new: true }).select('-password').lean().exec();
};

export const updateUser = async (id, data, file) => {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError(404, 'user not found');
  }

  if (file) {
const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

if (!allowedTypes.includes(file.mimetype)) {
  throw new AppError(400, 'Only JPG, JPEG, and PNG images are allowed');
}
    if (user.avatarPublicId) {
      await imagekit.deleteFile(user.avatarPublicId);
    }

    // This calls your working ImageKit helper
    const uploaded = await uploadToCloudinary(file);

    user.avatar = uploaded.secure_url;
    user.avatarPublicId = uploaded.public_id;
  }

  const allowedFields = ['username', 'email'];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      user[field] = data[field];
    }
  });

  await user.save();

  return await User.findById(user._id).select('-password');
};

export const getAllUsers = async (query) => {
  const page = new Pagination(User.find({ isActive: true }), query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const users = await page.query.select('-password').lean();
  return users;
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
