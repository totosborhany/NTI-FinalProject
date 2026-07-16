//import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import {User} from "../models/users.js";
import Bcrypt from 'bcrypt';
import { AppError } from '../utils/AppError.js';
import jwt from 'jsonwebtoken';
import crypto from "crypto";
// import {Email} from "../utils/email";


const signJwtAccessToken = (userId) => {
    const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    const accessExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
    return jwt.sign({ id: userId }, accessSecret, {
        expiresIn: accessExpiresIn,
    });
};

const signJwtRefreshToken = (userId) => {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRATION || '7d';
    return jwt.sign({ id: userId }, refreshSecret, {
        expiresIn: refreshExpiresIn,
    });
};

const createCookie = (res, userId, type) => {
    if (type === "accessToken") {
        const accessMaxAge = Number(process.env.JWT_ACCESS_EXPIRATION_MINUTES || 15) * 60 * 1000;
        return res.cookie("accessToken", signJwtAccessToken(userId), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: accessMaxAge,
        });
    } else if (type === "refreshToken") {
        const refreshMaxAge = Number(process.env.JWT_REFRESH_EXPIRATION_DAYS || 7) * 24 * 60 * 60 * 1000;
        return res.cookie("refreshToken", signJwtRefreshToken(userId), {
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
        // FIX: Explicitly check for false. If it's true or undefined, block registration.
        if (existing.isActive !== false) {
            return next(new AppError(400, "Email already exists"));
        }

        await User.findByIdAndDelete(existing.id);
    }
    const existingName = await User.findOne({ username: username });
    if(existingName){
        return next(new AppError(409, "sorry username already exists"));

    }
    
    const newUser = await User.create(req.body);
    
    const absoluteUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}/${newUser._id}`;

    await createCookie(res, newUser._id, "accessToken");
    await createCookie(res, newUser._id, "refreshToken");

    return res.status(201)
       .location(absoluteUrl)
       .json(ApiResponse.success("User registered successfully"));
});

export const login =catchAsync(async (req,res,next)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return next(new AppError(400,"all fields are required"));
    }
 const myUser = await User.findOne({email:email});
    if(! myUser || !(await Bcrypt.compare(password,myUser.password))){
        return next(new AppError(401,"sorry invalid credentiels"));
    } 
        createCookie(res,myUser._id,"accessToken");
        createCookie(res,myUser._id,"refreshToken");

        res.status(200).json(ApiResponse.success("User logged in successfully"));

});


export const logout = catchAsync(async (req, res, next) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.status(200).json(ApiResponse.success("Logged out successfully"));
});
// TODO cache the refresh token in a caching db for faster performace in v2
//TODO socket.io in v2
export const refresh = catchAsync(async (req,res,next)=>{

const refreshToken = req.cookies.refreshToken;
if(!refreshToken){
return next(new AppError(401,"please log in first"));
}
    let decoded;
    try {
        const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
        decoded = jwt.verify(refreshToken, refreshSecret);
    } catch (err) {
        return next(new AppError(401, "Your session has expired. Please log in again."));
    }
 

    const user = await User.findById(decoded.id);
    if(!user){
        return next(new AppError(401, "The user belonging to this token no longer exists."));
    }
    createCookie(res, user._id, "accessToken");
    res.status(200).json(ApiResponse.success("Token renewed"));


});

//TODO forget passweord in v2