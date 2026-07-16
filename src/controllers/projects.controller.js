import {getAllMembersService, getAllMyProjectsService, createProjectService, getProjectByIdService, updateProjectService, deleteProjectService, addMemberService, removeMemberService, changeMemberRoleService, archiveProjectService, restoreProjectService } from '../services/projects.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getAllMyProjects = catchAsync(async (req, res, next) => {
  const myProjects = await getAllMyProjectsService(req.query,req.user.id);
  if (!myProjects) {
    return next(new AppError(404, 'you dont have projects yet'));
  }
  return res.status(200).json(ApiResponse.success('here are your projects', myProjects));
});

export const createProject = catchAsync(async (req, res, next) => {
  const created = await createProjectService(req.body, req.user.id);
  if (!created) {
    return next(new AppError(400, 'problem in creating project'));
  }
  const absoluteUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}/${created._id}`;

  return res.status(201)
    .location(absoluteUrl)
    .json(ApiResponse.success('project created  successfully', created));
});

export const getProjectById = catchAsync(async (req, res) => {
  const project = await getProjectByIdService(req.params.projectId, req.user.id);
  return res.status(200).json(ApiResponse.success('project found', project));
});

//FIXED
export const updateProject = catchAsync(async (req, res) => {
  const project = await updateProjectService(req.params.projectId, req.body);
  return res.status(201).json(ApiResponse.success('project updated successfully', null));
});

export const deleteProject = catchAsync(async (req, res) => {
  const project = await deleteProjectService(req.params.projectId);
  return res.status(200).json(ApiResponse.success('project deleted successfully', project));
});

export const addMember = catchAsync(async (req, res) => {
  const project = await addMemberService(req.params.projectId, req.body);
  return res.status(200).json(ApiResponse.success('member added successfully', project));
});

export const removeMember = catchAsync(async (req, res) => {
  const project = await removeMemberService(req.params.projectId, req.params.userId);
  return res.status(200).json(ApiResponse.success('member removed successfully', project));
});

export const changeMemberRole = catchAsync(async (req, res) => {
  const project = await changeMemberRoleService(req.params.projectId, req.params.userId, req.body);
  return res.status(200).json(ApiResponse.success('member role updated successfully', project));
});

export const archiveProject = catchAsync(async (req, res) => {
  const project = await archiveProjectService(req.params.projectId);
  return res.status(200).json(ApiResponse.success('project archived successfully', project));
});

export const restoreProject = catchAsync(async (req, res) => {
  const project = await restoreProjectService(req.params.projectId);
  return res.status(200).json(ApiResponse.success('project restored successfully', project));
});
export const getAllMembers = catchAsync(async (req,res,next)=>{
  const members = await getAllMembersService(req.params.projectId);
  if(!members){
return next(new AppError(400,"Sorry no members"));
  }
  return res.status(200).json(ApiResponse.success('members returned successfully', members));
});