import { User } from '../models/users.js';
import { Project } from '../models/projects.js';
import { AppError } from '../utils/AppError.js';
import { Pagination } from '../utils/pagination.js';
import { Task } from '../models/tasks.js';
import { Invitation } from '../models/invitations.js';
import {ActivityLog} from "../models/logs.js";
import { Notification } from '../models/notifications.js';
import {Attachment}from "../models/attachments.js";
import {imagekit} from "../config/cloudinary.js";
import { Comment } from '../models/comments.js';
const populateProject = async (project) => {
  return await project.populate([{ path: 'owner' }, { path: 'members.user' }]);
};

export const getAllMyProjectsService = async (query,userId) => {
   
const page  = new Pagination(
  Project.find({
    $or: [
      { owner: userId },
      { "members.user": userId }
    ]
  })
    .populate("owner")
    .populate("members.user")

  ,query).filter().limitFields().sort().paginate();

const projects = await page.query.lean();

if(!projects){
throw new AppError(400,"sorry no projects");
}  


  const totalItems = projects.length;
  const pageNumber = query.page || 1;
  const limit = query.limit || 10;

  const meta = {
    page: pageNumber,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    hasNextPage: pageNumber < Math.ceil(totalItems / limit),
    hasPreviousPage: pageNumber > 1,
  };

  const summary = {
    projectCount: totalItems,
  };
return { data: projects, meta, summary };
};

export const createProjectService = async (data, userId) => {
  const project = await Project.create({
    ...data,
    owner: userId,
    members: [
      {
        user: userId,
        role: "OWNER"
      }
    ]
  });

  
await Promise.all([
    ActivityLog.create({
        project: project._id,
        actor: userId,
        type: "PROJECT_CREATED",
        entityType: "Project",
        entityId: project._id,
        message: `Project "${project.name}" was created`
    }),
    Notification.create({
        receiver: userId,
        type: "project",
        title: "Project Created",
        message: `Project "${project.name}" was created successfully`
    })
]);

  return project;
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

export const updateProjectService = async (projectid, data,userId) => {
  const allowedFields = ['name', 'description', 'color', 'visibility', 'status'];
const project = await Project.findById(projectid);
if(!project){
    throw new AppError(403, 'project doesnt even eist');

}
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      project[field] = data[field];
    }
  });

  await project.save();
    await ActivityLog.create({
    project: project._id,
    actor: userId,
    type: "PROJECT_UPDATED",
    entityType: "Project",
    entityId: project._id,
    message: `Project "${project.name}" was updated`
  });

  return await populateProject(project);
};

export const deleteProjectService = async (projectId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new AppError(404, "Project not found");
  }

  const attachments = await Attachment.find({ project: projectId });

  await Promise.all(
    attachments.map(async (attachment) => {
      if (attachment.publicId) {
        await imagekit.deleteFile(attachment.publicId);
      }
    })
  );

  await Promise.all([
    Comment.deleteMany({ task: { $in: await Task.find({ project: projectId }).distinct("_id") } }),
    Task.deleteMany({ project: projectId }),
    Attachment.deleteMany({ project: projectId }),
    Invitation.deleteMany({ project: projectId }),
    ActivityLog.deleteMany({ project: projectId }),
    Project.findByIdAndDelete(projectId),
  ]);

  return project;
};

export const addMemberService = async (project, data,actorId) => {
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
 await Promise.all([
  project.save(),
  ActivityLog.create({
    project: project._id,
    actor: actorId,
    type: "MEMBER_JOINED",
    entityType: "Project",
    entityId: project._id,
    message: `User: ${user.username} joined project "${project.name}"`
  })
]);
  return await populateProject(project);
};

export const removeMemberService = async (projectid, userId, actorId) => {
  const project = await Project.findById(projectid);
  if (!project) {
    throw new AppError(404, 'project not found');
  }
  if (project.owner.toString() === userId.toString()) {
    throw new AppError(400, 'owner cannot be removed');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'user not found');
  }

  const memberIndex = project.members.findIndex((member) => member.user.toString() === userId.toString());
  if (memberIndex === -1) {
    throw new AppError(404, 'member not found');
  }

  project.members.splice(memberIndex, 1);
  await Promise.all([
    project.save(),
    ActivityLog.create({
      project: project._id,
      actor: actorId,
      type: "MEMBER_LEFT",
      entityType: "Project",
      entityId: project._id,
      message: `User :${user.username} left project "${project.name}"`
    })
  ]);
  return await populateProject(project);
};

export const changeMemberRoleService = async (project, userId, data,actorId) => {
  const role = data?.role?.toUpperCase();

  if (!role) {
    throw new AppError(400, 'role is required');
  }

  if (!['ADMIN', 'MEMBER'].includes(role)) {
    throw new AppError(400, 'role must be ADMIN or MEMBER');
  }
  const myproject = await Project.findById(project );
  console.log(myproject);
  const member = myproject.members.find((item) => item.user.toString() === userId.toString());
  if (!member) {
    throw new AppError(404, 'member not found');
  }

  if (member.role === 'OWNER') {
    throw new AppError(400, 'owner role cannot be changed');
  }

  member.role = role;
  
await Promise.all([
 myproject.save(),
  ActivityLog.create({
    project: myproject,
    actor: actorId,
    type: "MEMBER_ROLE_CHANGED",
    entityType: "Project",
    entityId: project,
    message: `User : ${member.username}role changed to ${role} in project "${myproject.name}"`
  })
]);

  return await populateProject(myproject);
};

// export const archiveProjectService = async (project) => {
//   project.status = 'Archived';
//   await project.save();
//   return await populateProject(project);
// };


// export const restoreProjectService = async (project) => {
//   project.status = 'Active';
//   await project.save();
//   return await populateProject(project);
// };
export const getAllMembersService = async (projectId) => {
  // Chain the populate methods directly to the query
  const project = await Project.findById(projectId)
    .populate("owner")
    .populate("members.user");

  if (!project) {
    throw new AppError(404, "couldnt find project");
  }

  // Now that the project is populated, you can safely return the members
  return project.members;
};