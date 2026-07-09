import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Comment must belong to a task"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment author is required"],
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [4000, "Comment content cannot exceed 4000 characters"],
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

commentSchema.index({ task: 1 });
commentSchema.index({ author: 1 });

export const Comment = mongoose.model("Comment", commentSchema);
