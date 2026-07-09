import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Checklist item text is required"],
      trim: true,
      maxlength: [500, "Checklist item text cannot exceed 500 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Task must belong to a project"],
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [120, "Task title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [4000, "Description cannot exceed 4000 characters"],
    },
    status: {
      type: String,
      enum: ["Todo", "In Progress", "Done"],
      default: "Todo",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task creator is required"],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    labels: {
      type: [String],
      default: [],
    },
    checklist: {
      type: [checklistItemSchema],
      default: [],
    },
    attachments: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attachment" }],
      default: [],
    },
    comments: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "Order cannot be negative"],
    },
  },
  { timestamps: true }
);

taskSchema.index({ project: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ dueDate: 1 });

export const Task = mongoose.model("Task", taskSchema);