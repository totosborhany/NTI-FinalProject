import { Notification } from '../models/notifications.js';

export const notificationsService = {
  createNotification: async ({ receiver, sender = null, type, title, message, metadata = {} }) => {
    if (!receiver) {
      return null;
    }

    return Notification.create({
      receiver,
      sender,
      type,
      title,
      message,
      metadata,
    });
  },

  getUserNotifications: async (userId) => {
    return Notification.find({ receiver: userId }).sort({ createdAt: -1 });
  },

  markAsRead: async (notificationId, userId) => {
    return Notification.findOneAndUpdate(
      { _id: notificationId, receiver: userId },
      { read: true },
      { new: true }
    );
  },

  placeholder: async () => ({
    module: 'notifications',
    message: 'Notifications service scaffold is ready. Implement business logic next.',
  }),
};
