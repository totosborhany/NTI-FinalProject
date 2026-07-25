import { User } from '../models/users.js';
import { AppError } from '../utils/AppError.js';
import {imagekit} from "../config/cloudinary.js";
import {Pagination} from  "../utils/pagination.js";
import redis from "../config/redisSetup.js";
import {uploadToCloudinary} from "../utils/uploadToCloudinary.js";
import { Project } from '../models/projects.js';
import { Task } from '../models/tasks.js';
import {Notification} from "../models/notifications.js";
import { Invitation } from '../models/invitations.js';

export const userData = async (id) => {
    const key = `user:${id}:profile`;

    // 1. Check Redis first
    const cached = await redis.get(key);

    if (cached) {
        console.log('Redis HIT');
        return JSON.parse(cached);
    }

    console.log('Redis MISS');

    // 2. Fetch user
    const user = await User.findById(id)
        .select('-password')
        .lean();

    if (!user) {
        return null;
    }

    // 3. Calculate dashboard stats in parallel
    const [
        projectCount,
        taskCount,
        completedTaskCount,
        unreadNotifications,
        pendingInvitations
    ] = await Promise.all([
        Project.countDocuments({ 'members.user': id }),
        Task.countDocuments({ assignee: id }),
        Task.countDocuments({ assignee: id, status: 'DONE' }),
        Notification.countDocuments({ receiver: id, isRead: false }),
        Invitation.countDocuments({ receiver: id, status: 'PENDING' })
    ]);

    const summary = {
        projectCount,
        taskCount,
        completedTaskCount,
        unreadNotifications,
        pendingInvitations
    };

    const result = { user, summary };

    // 4. Cache the whole result for 5 minutes
    await redis.set(
        key,
        JSON.stringify(result),
        {
            EX: 60 * 5
        }
    );

    return result;
};
// export const deleteUser = async (id) => {

//   return await User.findByIdAndUpdate(id, { isActive: false }, { new: true }).select('-password').lean().exec();
// };

export const updateUser = async (id, data, file) => {
  const user = await User.findById(id);
  await redis.del(`user:${id}:profile`);
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
    try{
    const uploaded = await uploadToCloudinary(file);

    user.avatar = uploaded.secure_url;
    user.avatarPublicId = uploaded.public_id;
  }
    catch(err){
      throw new AppError(500,`file upload failed: ${err.message}`);
    }
  }

  const allowedFields = ['username', 'email'];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      user[field] = data[field];
    }
  });
  const emailAlreadyExist  = await User.findOne({email
    :user.email
  });

if(emailAlreadyExist && emailAlreadyExist._id.toString() !== user._id.toString()){
  throw new AppError(400, 'Email already exists');
}

const NameAlreadyExist = await User.findOne({
  username: user.username
});

if (
  NameAlreadyExist &&
  NameAlreadyExist._id.toString() !== user._id.toString()
) {
  throw new AppError(400, "Username already exists");
}

  await user.save();

  return await User.findById(user._id).select('-password');
};

export const getAllUsers = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const filter = { isActive: true };

  const totalItems = await User.countDocuments(filter);

  const pagination = new Pagination(User.find(filter), query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await pagination.query.select("-password").lean();

  const meta = {
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    hasNextPage: page < Math.ceil(totalItems / limit),
  hasPreviousPage: page > 1,
  };

  const summary = {
    activeUsers: totalItems,
  };

  return {
    data: users,
    meta,
    summary,
  };
};
export const createUser = async (data) => {
  const newUser = await User.create(data);
  return await User.findById(newUser._id).select('-password').lean().exec();
};

export const getUserById = async (id) => {
  return await User.findById(id).select('-password').lean().exec();
};

export const updateUserById = async (id, data) => {
  if(data.password || data.avatar ||data.avatarPublicId ){
    throw new AppError(400, 'password, avatar and avatarPublicId cannot be updated');
  }
 const emailAlreadyExist  = await User.findOne({email
    :data.email
  });

if(emailAlreadyExist && emailAlreadyExist._id.toString() !== id.toString()){
  throw new AppError(400, 'Email already exists');
}

const NameAlreadyExist = await User.findOne({
  username: data.username
});

if (
  NameAlreadyExist &&
  NameAlreadyExist._id.toString() !== id.toString()
) {
  throw new AppError(400, "Username already exists");
}

  return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-password').lean().exec();
};

export const deleteUserById = async (id) => {
    const user = await User.findById(id);
      await redis.del(`user:${id}:profile`);

    if (!user) {
        throw new AppError(404, "User not found");
    }

    if (user.avatarPublicId) {
        await imagekit.deleteFile(user.avatarPublicId);
        user.avatar = "";
        user.avatarPublicId = "";
    }

    user.isActive = false;

    await user.save();

    user.password = undefined;


    return user;
};
export const updateUserPassword = async (id, oldpassword, newPassword, confirmNewPassword) => {
  const user = await User.findById(id).select('+password');
  if (!user) return false;

  const isMatch = await user.comparePassword(oldpassword);
  if (!isMatch) return false;

  if (newPassword !== confirmNewPassword) {
    return false; 
  }

  user.password = newPassword; 
  
  await user.save();
  return true;
};
