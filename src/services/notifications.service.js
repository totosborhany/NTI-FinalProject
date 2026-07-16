import { Notification } from '../models/notifications.js';
import { Pagination } from '../utils/pagination.js';
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

  getUserNotifications: async (query,userId) => {
    const page = new Pagination(Notification.find({ receiver: userId }).sort({ createdAt: -1 })
    ,query).filter().limitFields().paginate().sort();

    const results = await page.query.lean();
    return results;


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
