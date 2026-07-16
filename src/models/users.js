import mongoose from "mongoose";
import Bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [5, "Username must be at least 5 characters"],
      maxlength: [50, "Username cannot exceed 50 characters"],  
      match: [/^[A-Za-z0-9_]+$/,"Username can only contain letters, numbers, and underscores",
    ], 
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
    isActive:{
      type:Boolean,
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
      type:Date,
      default : new Date()
    } ,
    passwordResetToken: String,
    passwordResetExpires: Date,
    
  },
  { timestamps: true }
);

userSchema.pre('save',async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await Bcrypt.genSalt(10);
  this.password = await Bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // 'this.password' refers to the hashed password of the current user document
    return await Bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};


userSchema.methods.createResetToken = async function () {
  const resetToken = await crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = await crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires  = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.method.createPasswordResetToken = async function (){

};
export const User = mongoose.model("User", userSchema);