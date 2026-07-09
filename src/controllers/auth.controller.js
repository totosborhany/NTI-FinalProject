import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import {User} from "../models/users.js";
import Bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError.js';
import jwt from 'jsonwebtoken';



const signJwtAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {

        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const signJwtRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRATION,
    });
};

const createCookie = (res, userId, type) => {
    if (type === "accessToken") {
        return res.cookie("accessToken", signJwtAccessToken(userId), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: Number(process.env.JWT_ACCESS_EXPIRATION_MINUTES) * 60 * 1000,
        });
    } else if (type === "refreshToken") {
        return res.cookie("refreshToken", signJwtRefreshToken(userId), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: Number(process.env.JWT_REFRESH_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000,
        });
    }
};

export const register = catchAsync(async (req, res, next) => {
    const { username, email, password, confirmPassword } = req.body;
    
    if (!username || !email || !password || !confirmPassword) {
        return next(new AppError(400, "All fields are required"));
    }
    
    if (await User.findOne({ email: email })) {
        return next(new AppError(400, "Email already exists"));
    }
    
 if (password !== confirmPassword) {
        return next(new AppError(400, "Passwords do not match"));
    }
    const newUser = await User.create({
        username,
        email,
        password
    });
    
    const absoluteUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}/${newUser._id}`;

    createCookie(res, newUser._id, "accessToken");
    createCookie(res, newUser._id, "refreshToken");

    res.status(201)
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
// TODO cache the refresh token in a caching db for fster performace 
export const refresh = catchAsync(async (req,res,next)=>{

const refreshToken = req.cookies.refreshToken;
if(!refreshToken){
return next(new AppError(401,"please log in first"));
}
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
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