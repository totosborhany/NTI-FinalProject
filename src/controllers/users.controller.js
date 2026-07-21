import {
  userData,
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
import Email from "../utils/email.js";
import crypto from "crypto";
import { Project } from '../models/projects.js';
import{Task} from "../models/tasks.js";
import { Invitation } from '../models/invitations.js';
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
  const done = await deleteUserByIdService(userId);
  if (!done) {
    return next(new AppError(404, 'sorry a problem occured'));
  }
  await Promise.all([
    Project.updateMany(
        {},
        {
            $pull: {
                members: { user: userId}
            }
        }
    ),

    Invitation.deleteMany({
        $or: [
            { sender: userId },
            { receiver: userId }
        ]
    }),

    Task.updateMany(
        { assignee: userId},
        {
            $unset: { assignee: "" }
        }
    )
]);

  res.status(200).json(ApiResponse.success('User deleted successfully', null));
});

export const updateMe = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const data = req.body;
  if (  Object.keys(req.body).length === 0 &&
  !req.file) {
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
try{
  const result = await getAllUsersService(req.query);

res.status(200).json(
  ApiResponse.success(
    "Users fetched successfully",
    result.data,
    result.meta,
    result.summary
  )
);}
catch(err){
  next(new AppError(500,`sorry a problem occured: ${err.message}`));
}

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
export const forgotPassword = catchAsync(async (req,res,next)=>{
const userEmail = req.body.email;
const user = await User.findOne({email:userEmail});
if(!user){
  return res
    .status(200)
    .json(ApiResponse.success("If an account exists, a reset link has been sent."));}
const resetToken = user.createResetToken();
await user.save({validateBeforeSave:false});
let resetURL;
if(process.env.ENVIRONMENT === "development"){
 resetURL= `${req.protocol}://${req.get('host')}/api/v1/users/reset-password?token=${resetToken}`;

}else if(process.env.ENVIRONMENT === "production"){
   resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

}
const email = new Email(`here is your reset password link ${resetURL} valid for 10 minutes only`,user) ;
try{
await email.send("reset password link");}
catch(err){
  
      user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(500, "Failed to send email"));

}
return res.status(200).json(ApiResponse.success('reset password link sent to your email'));
});
export const resetPassword = catchAsync(async(req,res,next)=>{
const {password,confirmPassword} = req.body;
const {token}  = req.query;
if (!token) {
  return next(new AppError(400, "Reset token is required"));
}
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
 if(password!==confirmPassword){
         return next(new AppError(400, "Failed to reset password Passwords do not match"));

 }
  const user = await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}});  
  if(!user){
         return next(new AppError(400, "Failed to reset password Invalid or expired reset token"));
  }
user.passwordResetToken = undefined;
user.passwordResetExpires = undefined;
user.password = password;
await user.save();
res.status(200).json(ApiResponse.success('password reset successfully'));


});