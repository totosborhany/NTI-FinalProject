import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { Project } from "../models/projects.js";

export const authorizeProjectTo = (...roles) => {
  return async (req, res, next) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return next(new AppError(404, "Project not found"));
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user.id
    );

    if (!member) {
      return next(new AppError(403, "You are not a member of this project"));
    }

    if (!roles.includes(member.role)) {
      return next(new AppError(403, "You are not authorized to perform this action"));
    }

    next();
  };
};