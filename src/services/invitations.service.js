import { Invitation } from '../models/invitations.js';
import { User } from '../models/users.js';
import { AppError } from '../utils/AppError.js';
import { Project } from '../models/projects.js';
import { notificationsService } from './notifications.service.js';

export const sendInvitation = async (userId, recieverEmail, projectId) => {
  const reciever = await User.findOne({ email: recieverEmail });
  if (!reciever) {
    throw new AppError(404, 'sorry reciever email doesnt exist');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(404, 'project not found');
  }

  const isAlreadyMember = project.members.some(
    (member) => member.user.toString() === reciever._id.toString()
  );

  if (isAlreadyMember) {
    throw new AppError(400, 'cant invite a Member');
  }

  const invitation = await Invitation.create({
    project: projectId,
    receiver: reciever._id,
    sender: userId,
  });

  await notificationsService.createNotification({
    receiver: reciever._id,
    sender: userId,
    type: 'invitation',
    title: 'Project invitation',
    message: `You have been invited to join the project "${project.name}".`,
    metadata: {
      projectId: project._id,
      projectName: project.name,
      invitationId: invitation._id,
    },
  });

  return invitation;
};

export const editInvitationService = async (projectId, invitationId, data) => {
  const invitation = await Invitation.findOne({ _id: invitationId, project: projectId });

  if (!invitation) {
    throw new AppError(404, 'invitation not found');
  }

  // Prevent modifying an invitation that was already handled
  if (invitation.status === 'Accepted' || invitation.status === 'Rejected') {
    throw new AppError(400, 'This invitation has already been handled');
  }

  if (data.status) {
    const validStatuses = ['Pending', 'Accepted', 'Rejected'];
    if (!validStatuses.includes(data.status)) {
      throw new AppError(400, 'invalid invitation status');
    }
    invitation.status = data.status;

    // FIX: If accepted, automatically add the user to the project's members array
    if (data.status === 'Accepted') {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new AppError(404, 'Associated project not found');
      }

      // Check if they are already a member to prevent duplicates
      const isAlreadyMember = project.members.some(
        (m) => m.user.toString() === invitation.receiver.toString()
      );

      if (!isAlreadyMember) {
        project.members.push({ user: invitation.receiver, role: 'MEMBER' });
        await project.save(); // This triggers your pre('save') hook safely!
      }
    }
  }

  if (data.expiresAt) {
    invitation.expiresAt = new Date(data.expiresAt);
  }

  await invitation.save();
  return invitation;
};

export const deleteInvitationService = async (projectId, invitationId) => {
  const invitation = await Invitation.findOneAndDelete({ _id: invitationId, project: projectId });

  if (!invitation) {
    throw new AppError(404, 'invitation not found');
  }

  return invitation;
};

export const getMyInvitations = async (userId) => {
  return await Promise.all([
    Invitation.find({ receiver: userId }).populate('project', 'name'),
    Invitation.find({ sender: userId }).populate('project', 'name'),
  ]);
};

export const reactToinvitationService = async (userId, invitationId, status) => {
  // 1. Fetch the invitation and populate the full project document
  const invitation = await Invitation.findById(invitationId).populate('project');

  if (!invitation) {
    throw new AppError(404, 'Invitation not found');
  }

  if (invitation.receiver.toString() !== userId.toString()) {
    throw new AppError(403, 'You are not authorized to respond to this invitation');
  }

  if (!invitation.project) {
    throw new AppError(404, 'The project associated with this invitation no longer exists');
  }

  if (invitation.status !== 'Pending') {
    throw new AppError(400, 'This invitation has already been handled');
  }

  if (status === "Accepted") {
    const project = invitation.project; 

    const isAlreadyMember = project.members.some(
      (member) => member.user.toString() === userId.toString()
    );

    if (!isAlreadyMember) {
      project.members.push({ user: userId, role: 'MEMBER' });
      
      await project.save(); 
    }

    invitation.status = 'Accepted';

  } else if (status === "Rejected") {
    invitation.status = 'Rejected';
    
  } else {
    throw new AppError(400, 'Invalid status action. Use Accepted or Rejected.');
  }

  // 4. Save the invitation status update
  await invitation.save();
  return invitation;
};