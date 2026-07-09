import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Activity must belong to a project"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Activity user is required"],
    },
    action: {
      type: String,
      enum: [
        "PROJECT_CREATED",
        "TASK_CREATED",
        "TASK_UPDATED",
        "TASK_MOVED",
        "TASK_ASSIGNED",
        "COMMENT_ADDED",
        "FILE_UPLOADED",
        "MESSAGE_SENT",
        "INVITATION_SENT",
      ],
      required: [true, "Activity action is required"],
    },
    entityType: {
      type: String,
      required: [true, "Entity type is required"],
      enum: ["Project", "Task", "Comment", "Attachment", "Message", "Invitation"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ user: 1 });

export const Activity = mongoose.model("Activity", activitySchema);
