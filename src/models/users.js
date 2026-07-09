import mongoose from "mongoose";
import { boolean, minLength } from "zod";
import Bcrypt from "bcrypt"
import { validate } from "../middlewares";

const userSchema = new mongoose.Schema(
  {
    
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [5, "Username must be at least 5 characters"],
      maxlength: [50, "Username cannot exceed 50 characters"],
      match: [/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
        avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    active:{
      type:boolean,
      default:true
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    createdAt:{
      default : new Date()
    }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.pre('save',async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await Bcrypt.genSalt(10);
  this.password = await Bcrypt.hash(this.password, salt);
  next();
});

export const User = mongoose.model("User", userSchema);