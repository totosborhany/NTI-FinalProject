import { Task } from '../models/tasks.js';
import { Project } from '../models/projects.js';
import { User } from '../models/users.js';
import { Comment } from '../models/comments.js';
import { Attachment } from '../models/attachments.js';
import { AppError } from '../utils/AppError.js';
import { notificationsService } from './notifications.service.js';
import {Pagination} from "../utils/pagination.js";
const populateTask = async (task) => {
  await task.populate([{ path: 'creator' }, { path: 'assignee' }]);
  return task;
};


const normalizeLabels = (labels) => {
  if (!Array.isArray(labels)) {
    return [];
  }

  return labels
    .map((label) => label.trim())
    .filter((label) => label.length > 0);
};

export const getMyTaskService = async (query,userId)=>{

const page = new Pagination(
  Task.find({
    $or: [
      { creator: userId },       // Condition 1: You created/own the task
      { assignee: userId }    // Condition 2: You are assigned to the task
    ]
  }),
  query
)
  .filter()
  .sort()
  .limitFields()
  .paginate();

// 3. Execute the query
const tasks = await page.query.lean();

return tasks;
}
export const getTasksByProjectService = async (query,projectId) => {
  const project = await Project.findById(projectId);


  if (!project) {
    throw new AppError(404, 'project not found');
  }

  
 const page = new Pagination(
 Task.find({ project: projectId }).populate([{ path: 'creator' }, { path: 'assignee' }]),
  query
)
  .filter()
  .sort()
  .limitFields()
  .paginate();

const tasks = await page.query.lean();
 
  return tasks;
};

export const createTaskService = async (projectId, data, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(404, 'project not found');
  }

  let assignee = null;

  if (data.assignee !== undefined && data.assignee !== null) {
    assignee = await User.findById(data.assignee);
    if (!assignee) {
      throw new AppError(404, 'assignee not found');
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === assignee._id.toString()
    );

    if (!isMember) {
      throw new AppError(404, 'sorry he isn\'t a member invite him first');
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

  const lastTask = await Task.findOne({ project: projectId }).sort({ order: -1, createdAt: -1 }).select('order');

  const task = new Task({
    project: projectId,
    creator: userId,
    title: data.title,
    description: data.description || '',
    assignee: assignee ? assignee._id : null,
    status: data.status || 'TODO',
    priority: data.priority || 'MEDIUM',
    dueDate: data.dueDate || null,
    labels: normalizeLabels(data.labels),
    order: lastTask ? lastTask.order + 1 : 0,
  });

  await task.save();

  if (assignee) {
    await notificationsService.createNotification({
      receiver: assignee._id,
      sender: userId,
      type: 'task',
      title: 'Task assigned',
      message: `You have been assigned to "${task.title}" in project "${project.name}".`,
      metadata: {
        projectId: project._id,
        taskId: task._id,
        projectName: project.name,
      },
    });
  }

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
  const task = await Task.findById(taskId).populate('project');
  if (!task) {
    throw new AppError(404, 'task not found');
  }

  const previousAssigneeId = task.assignee ? task.assignee.toString() : null;

  if (data.assignee !== undefined) {
    let assignee = null;

    if (data.assignee !== null) {
      assignee = await User.findOne({email:data.assignee});
      if (!assignee) {
        throw new AppError(404, 'assignee not found');
      }

      const isMember = task.project.members.some(
        (member) => member.user.toString() === assignee._id.toString()
      );

      if (!isMember) {
        throw new AppError(404, 'sorry he isn\'t a member invite him first');
      }
    }
    console.log(task.assignee);
    task.assignee = assignee ? assignee._id : null;
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
    task.labels = normalizeLabels(data.labels);
  }

  await task.save();

  const shouldNotifyForAssignment = Boolean(
    task.assignee && previousAssigneeId !== task.assignee.toString()
  );

  if (shouldNotifyForAssignment) {
    await notificationsService.createNotification({
      receiver: task.assignee,
      sender: task.creator,
      type: 'task',
      title: 'Task assigned',
      message: `You have been assigned to "${task.title}" in project "${task.project.name}".`,
      metadata: {
        projectId: task.project._id,
        taskId: task._id,
        projectName: task.project.name,
      },
    });
  }

  return await populateTask(task);
};

export const deleteTaskService = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(404, 'task not found');
  }

  await Comment.deleteMany({ task: taskId });
  await Attachment.deleteMany({ task: taskId });
  await Task.findByIdAndDelete(taskId);

  return task;
};
