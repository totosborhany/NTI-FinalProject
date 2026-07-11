import { User } from '../models/users.js';
import { Project } from '../models/projects.js';
import { AppError } from '../utils/AppError.js';

const populateProject = async (project) => {
  return await project.populate([{ path: 'owner' }, { path: 'members.user' }]);
};

export const getAllMyProjectsService = async (userId) => {
  const projects = await Project.find({
    $or: [
      { owner: userId },
      { "members.user": userId }
    ]
  })
    .populate("owner")
    .populate("members.user");

  return projects;
};
export const createProjectService = async (data, userId) => {
  const project = new Project({
    ...data,
    owner: userId,
    members: [
        {
            user: userId,
            role: "OWNER"
        }
    ]
});
  return await project.save();
};

export const getProjectByIdService = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(404, 'project not found');
  }

  const isMember = project.members.some((member) => member.user.toString() === userId.toString()) || project.owner.toString() === userId.toString();
  if (!isMember) {
    throw new AppError(403, 'you are not a member of this project');
  }

  return await populateProject(project);
};

export const updateProjectService = async (project, data) => {
  const allowedFields = ['name', 'description', 'color', 'visibility', 'status'];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      project[field] = data[field];
    }
  });

  await project.save();
  return await populateProject(project);
};

export const deleteProjectService = async (projectId) => {
  const project = await Project.findByIdAndDelete(projectId);
  if (!project) {
    throw new AppError(404, 'project not found');
  }

  return project;
};

export const addMemberService = async (project, data) => {
  const userId = data?.userId;
  const role = data?.role?.toUpperCase();

  if (!userId) {
    throw new AppError(400, 'userId is required');
  }

  if (project.owner.toString() === userId.toString()) {
    throw new AppError(400, 'owner is already a member of this project');
  }

  const alreadyMember = project.members.some((member) => member.user.toString() === userId.toString());
  if (alreadyMember) {
    throw new AppError(400, 'member already exists');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'user not found');
  }

  const validRole = role === 'ADMIN' ? 'ADMIN' : 'MEMBER';
  project.members.push({ user: userId, role: validRole });
  await project.save();
  return await populateProject(project);
};

export const removeMemberService = async (project, userId) => {
  if (project.owner.toString() === userId.toString()) {
    throw new AppError(400, 'owner cannot be removed');
  }

  const memberIndex = project.members.findIndex((member) => member.user.toString() === userId.toString());
  if (memberIndex === -1) {
    throw new AppError(404, 'member not found');
  }

  project.members.splice(memberIndex, 1);
  await project.save();
  return await populateProject(project);
};

export const changeMemberRoleService = async (project, userId, data) => {
  const role = data?.role?.toUpperCase();

  if (!role) {
    throw new AppError(400, 'role is required');
  }

  if (!['ADMIN', 'MEMBER'].includes(role)) {
    throw new AppError(400, 'role must be ADMIN or MEMBER');
  }

  const member = project.members.find((item) => item.user.toString() === userId.toString());
  if (!member) {
    throw new AppError(404, 'member not found');
  }

  if (member.role === 'OWNER') {
    throw new AppError(400, 'owner role cannot be changed');
  }

  member.role = role;
  await project.save();
  return await populateProject(project);
};

export const archiveProjectService = async (project) => {
  project.status = 'Archived';
  await project.save();
  return await populateProject(project);
};

export const restoreProjectService = async (project) => {
  project.status = 'Active';
  await project.save();
  return await populateProject(project);
};