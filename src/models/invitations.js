import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Invitation must target a project"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver is required"],
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    expiresAt: {
      type: Date,
      required: [true, "Invitation expiration date is required"],
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

invitationSchema.index({ receiver: 1, status: 1 });
invitationSchema.index({ project: 1 });
invitationSchema.index({ expiresAt: 1 });

export const Invitation = mongoose.model("Invitation", invitationSchema);
