import mongoose from "mongoose";

const projectRoles = ["OWNER", "ADMIN", "MEMBER"];

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Member user is required"],
    },
    role: {
      type: String,
      enum: projectRoles,
      default: "MEMBER",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project owner is required"],
    },
    members: {
      type: [memberSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["Active", "Archived"],
      default: "Active",
    },
    visibility: {
      type: String,
      enum: ["Private", "Public"],
      default: "Private",
    },
    color: {
      type: String,
      default: "#4f46e5",
      match: [/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Color must be a valid hex value"],
    },
  },
  { timestamps: true }
);

projectSchema.pre("save", function (next) {
  if (!this.owner) {
    return next();
  }

  const existingOwnerMember = this.members?.find(
    (member) => member.user?.toString() === this.owner.toString()
  );

  if (!existingOwnerMember) {
    this.members = this.members || [];
    this.members.push({ user: this.owner, role: "OWNER" });
  } else if (existingOwnerMember.role !== "OWNER") {
    existingOwnerMember.role = "OWNER";
  }

  next();
});

projectSchema.index({ owner: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ visibility: 1 });
projectSchema.index({ "members.user": 1 });

export const Project = mongoose.model("Project", projectSchema);