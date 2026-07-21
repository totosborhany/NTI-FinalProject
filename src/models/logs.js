import mongoose from "mongoose";

const activityTypes = [
  "PROJECT_CREATED",
  "PROJECT_UPDATED",


  "TASK_CREATED",
  "TASK_UPDATED",
  "TASK_DELETED",
  "TASK_STATUS_CHANGED",

  "COMMENT_CREATED",
  "COMMENT_DELETED",
  "MEMBER_JOINED",
  "MEMBER_LEFT",
  "MEMBER_ROLE_CHANGED",

  "INVITATION_SENT",
  "INVITATION_ACCEPTED",
  "INVITATION_REJECTED",

  "ATTACHMENT_UPLOADED",
  "ATTACHMENT_DELETED"
];

const activityLogSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: activityTypes,
      required: true,
    },

    entityType: {
      type: String,
      enum: [
        "Project",
        "Task",
        "Comment",
        "Invitation",
        "Attachment",
        "Member",
      ],
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    message: {
      type: String,
      required: true,
      maxlength: 300,
    },

    createdAt:{
      type: Date,
      default: Date.now,
      index: true,
    }
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ project: 1, createdAt: -1 });
activityLogSchema.index({ actor: 1 });

export const ActivityLog = mongoose.model(
  "ActivityLog",
  activityLogSchema
);