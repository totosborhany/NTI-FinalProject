import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/users.js';


export const protect =catchAsync(async (req,res,next)=>{
const accessToken = req.cookies?.accessToken;
  if(!accessToken){
    return next(new AppError(401,"please Log in first"));
  }
let decoded;
  try{
  const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  decoded = jwt.verify(accessToken, accessSecret);
  }catch(err){
  return next( new AppError(401,"your session has expired please log in again"));
  }
const myUser  = await User.findById(decoded.id);
  if(!myUser){
         return next(new AppError(401,"The user belonging to this token no longer exists."));
  }

 req.user= myUser;
 next(); 
});