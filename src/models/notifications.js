import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification receiver is required"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: ["invitation", "task", "comment", "message", "project", "system"],
      required: [true, "Notification type is required"],
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [120, "Notification title cannot exceed 120 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [2000, "Notification message cannot exceed 2000 characters"],
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

notificationSchema.index({ receiver: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
