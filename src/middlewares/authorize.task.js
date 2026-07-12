import { AppError } from '../utils/AppError.js';
import { Project } from '../models/projects.js';
import { Task } from '../models/tasks.js';

export const authorizeTaskTo = (...roles) => {
  return async (req, res, next) => {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return next(new AppError(404, 'Task not found'));
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return next(new AppError(404, 'Project not found'));
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user.id
    );

    if (!member) {
      return next(new AppError(403, 'You are not a member of this project'));
    }

    if (roles.length && !roles.includes(member.role)) {
      return next(new AppError(403, 'You are not authorized to perform this action'));
    }

    req.task = task;
    req.project = project;
    next();
  };
};
