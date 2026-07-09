import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Message must belong to a project"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Message sender is required"],
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [4000, "Message content cannot exceed 4000 characters"],
    },
    attachments: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attachment" }],
      default: [],
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ project: 1 });
messageSchema.index({ sender: 1 });

export const Message = mongoose.model("Message", messageSchema);
