import { getMyTaskService,getTasksByProjectService, createTaskService, getTaskByIdService, updateTaskService, deleteTaskService } from '../services/tasks.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
export const getAllTasks  =catchAsync(async (req,res,next)=>{
  const result = await getMyTaskService(req.query,req.user.id);
  if(!result.data || result.data.length === 0){
    return next(new AppError(404, 'No tasks found for this project'));
  }
    return res.status(200).json(ApiResponse.success('Tasks retrieved successfully', result.data,result.meta,result.summary));

});
export const getTasksByProject = catchAsync(async (req, res, next) => {
  const tasks = await getTasksByProjectService(req.query,req.params.projectId);
  if (!tasks) {
    return next(new AppError(404, 'No tasks found for this project'));
  }
  return res.status(200).json(ApiResponse.success('Tasks retrieved successfully', tasks));
});

export const createTask = catchAsync(async (req, res, next) => {
  const task = await createTaskService(req.params.projectId, req.body, req.user.id);
  if (!task) {
    return next(new AppError(400, 'Could not create task'));
  }
  return res.status(201).json(ApiResponse.success('Task created successfully', task));
});

export const getTaskById = catchAsync(async (req, res, next) => {
  const task = await getTaskByIdService(req.params.taskId);
  return res.status(200).json(ApiResponse.success('Task retrieved successfully', task));
});

export const updateTask = catchAsync(async (req, res, next) => {
  const task = await updateTaskService(req.params.taskId, req.body);
  return res.status(200).json(ApiResponse.success('Task updated successfully', task));
});

export const deleteTask = catchAsync(async (req, res, next) => {
  await deleteTaskService(req.params.taskId);
  return res.status(200).json(ApiResponse.success('Task deleted successfully', null));
});
