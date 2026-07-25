//import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import {User} from "../models/users.js";
import Bcrypt from 'bcrypt';
import { AppError } from '../utils/AppError.js';
import jwt from 'jsonwebtoken';
import ms from "ms";
import redis from "../config/redisSetup.js";
import Email from "../utils/email.js";
import { editInvitationService } from '../services/invitations.service.js';
import { ca } from 'zod/locales';

const signJwtAccessToken = (userId) => {
    const accessSecret =  process.env.JWT_SECRET;
    const accessExpiresIn = process.env.JWT_ACCESS_EXPIRATION;
    return jwt.sign({ id: userId }, accessSecret, {
        expiresIn: accessExpiresIn,
    });
};

const signJwtRefreshToken = (userId) => {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRATION ;
    return jwt.sign({ id: userId }, refreshSecret, {
        expiresIn: refreshExpiresIn,
    });
};

const createCookie = (res, userId, type,token) => {
    if (type === "accessToken") {
        const accessMaxAge =ms(process.env.JWT_ACCESS_EXPIRATION);
        return res.cookie("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: accessMaxAge,
        });
    } else if (type === "refreshToken") {
        const refreshMaxAge =  ms(process.env.JWT_REFRESH_EXPIRATION);
        return res.cookie("refreshToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: refreshMaxAge,
        });
    }
};

export const register = catchAsync(async (req, res, next) => {
    const { username, email, password, confirmPassword } = req.body;
    
    if (!username || !email || !password || !confirmPassword) {
        return next(new AppError(400, "All fields are required"));
    }
    
    if (password !== confirmPassword) {
        return next(new AppError(400, "Passwords do not match"));
    }
    
    const existing = await User.findOne({ email: email });
    if (existing) {
        if (existing.isActive !== false) {
            return next(new AppError(409, "Email already exists"));
        }

        await User.findByIdAndDelete(existing._id);
    }
    const existingName = await User.findOne({ username: username });
    if(existingName){
        return next(new AppError(409, "sorry username already exists"));

    }
    
    const newUser = await User.create(req.body);
    

    createCookie(res, newUser._id, "accessToken", signJwtAccessToken(newUser._id));

    const refreshToken = signJwtRefreshToken(newUser._id);

    await redis.set(`refreshToken:${newUser._id}`, refreshToken, {
        EX: ms(process.env.JWT_REFRESH_EXPIRATION) / 1000, 
    });
 
     createCookie(res, newUser._id, "refreshToken", refreshToken);

    const responseUser = {
  _id: newUser._id,
  username: newUser.username,
  email: newUser.email,
  avatar: newUser.avatar,
  role: newUser.role,
  isVerified: newUser.isVerified,
  isActive: newUser.isActive,
  createdAt: newUser.createdAt,
};
    const userEmail= new Email("hello thank you for registering with us ",responseUser);
    await userEmail.send("welcome to project management app");
     res.status(201)
       .json(ApiResponse.success("User registered successfully",responseUser));
});



export const login = catchAsync(async (req,res,next)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return next(new AppError(400,"all fields are required"));
    }
 const myUser = await User.findOne({email:email})
 ;
    if(! myUser || !(await Bcrypt.compare(password,myUser.password))){
        return next(new AppError(401,"sorry invalid credentiels"));
    }

    createCookie(res, myUser._id, "accessToken", signJwtAccessToken(myUser._id));

    const refreshToken = signJwtRefreshToken(myUser._id);
    
    await redis.set(`refreshToken:${myUser._id}`, refreshToken, {
        EX: ms(process.env.JWT_REFRESH_EXPIRATION) / 1000, 
    });
 
     createCookie(res, myUser._id, "refreshToken", refreshToken);


        res.status(200).json(ApiResponse.success("User logged in successfully"));

});


export const logout = catchAsync(async (req, res, next) => {
try{
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });

    await redis.del(`refreshToken:${req.user._id}`);
   }catch(err){
    return next(new AppError(500,"sorry problem logging out"));
   }
    res.status(200).json(ApiResponse.success("Logged out successfully"));
});

export const refresh = catchAsync(async (req,res,next)=>{
const  refreshToken = req.cookies.refreshToken;
console.log(refreshToken);
if(!refreshToken){
return next(new AppError(401,"please log in first"));
}
       let decoded;
    try {
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        decoded = jwt.verify(refreshToken, refreshSecret);
    } catch (err) {
        return next(new AppError(401, "Your session has expired. Please log in again."));
    }
      const user = await User.findById(decoded.id);
    if(!user){
        return next(new AppError(401, "The user belonging to this token no longer exists."));
    }
    createCookie(res, user._id, "accessToken"),signJwtAccessToken(user._id);
    
    res.status(200).json(ApiResponse.success("Token renewed"));


});

