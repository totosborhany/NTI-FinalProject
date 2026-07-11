import { Task } from '../models/tasks.js';
import { Project } from '../models/projects.js';
import { User } from '../models/users.js';
import { AppError } from '../utils/AppError.js';

const populateTask = async (task) => {
  await task.populate('creator');
  await task.populate('assignee');
  return task;
};

export const getTasksByProjectService = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(404, 'project not found');
  }

  const tasks = await Task.find({ project: projectId }).populate('creator').populate('assignee');
  return tasks;
};

export const createTaskService = async (projectId, data, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(404, 'project not found');
  }

  if (data.assignee) {
    const assignee = await User.findById(data.assignee);
    if (!assignee) {
      throw new AppError(404, 'assignee not found');
    }
  }

  const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
  const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];

  if (data.status && !validStatuses.includes(data.status)) {
    throw new AppError(400, 'invalid task status');
  }

  if (data.priority && !validPriorities.includes(data.priority)) {
    throw new AppError(400, 'invalid task priority');
  }

  const task = new Task({
    project: projectId,
    creator: userId,
    title: data.title,
    description: data.description || '',
    assignee: data.assignee || null,
    status: data.status || 'TODO',
    priority: data.priority || 'MEDIUM',
    dueDate: data.dueDate || null,
    labels: Array.isArray(data.labels) ? data.labels : [],
  });

  await task.save();
  return await populateTask(task);
};

export const getTaskByIdService = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(404, 'task not found');
  }

  return await populateTask(task);
};

export const updateTaskService = async (taskId, data) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(404, 'task not found');
  }

  if (data.assignee !== undefined) {
    if (data.assignee) {
      const assignee = await User.findById(data.assignee);
      if (!assignee) {
        throw new AppError(404, 'assignee not found');
      }
    }
    task.assignee = data.assignee || null;
  }

  const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
  const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];

  if (data.status !== undefined) {
    if (!validStatuses.includes(data.status)) {
      throw new AppError(400, 'invalid task status');
    }
    task.status = data.status;
  }

  if (data.priority !== undefined) {
    if (!validPriorities.includes(data.priority)) {
      throw new AppError(400, 'invalid task priority');
    }
    task.priority = data.priority;
  }

  if (data.title !== undefined) {
    task.title = data.title;
  }

  if (data.description !== undefined) {
    task.description = data.description;
  }

  if (data.dueDate !== undefined) {
    task.dueDate = data.dueDate;
  }

  if (data.labels !== undefined) {
    task.labels = Array.isArray(data.labels) ? data.labels : task.labels;
  }

  await task.save();
  return await populateTask(task);
};

export const deleteTaskService = async (taskId) => {
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) {
    throw new AppError(404, 'task not found');
  }

  return task;
};
