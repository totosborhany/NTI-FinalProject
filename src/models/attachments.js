import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader is required"],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, "Original file name is required"],
      trim: true,
    },
    publicId: {
      type: String,
      required: [true, "Cloud storage public ID is required"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "Attachment URL is required"],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
      trim: true,
      match: [/^[a-z]+\/[a-z0-9.+-]+$/i, "Please provide a valid MIME type"],
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
      min: [1, "File size must be greater than zero"],
    },
  },
  { timestamps: true }
);

attachmentSchema.index({ project: 1 });
attachmentSchema.index({ task: 1 });
attachmentSchema.index({ uploadedBy: 1 });

export const Attachment = mongoose.model("Attachment", attachmentSchema);