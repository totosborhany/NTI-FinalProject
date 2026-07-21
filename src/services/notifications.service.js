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


  const meta = {
    page: query.page || 1,
    limit: query.limit || 10,
    totalItems: results.length,
    totalPages: Math.ceil(results.length / (query.limit || 10)),
    hasNextPage: (query.page || 1) < Math.ceil(results.length / (query.limit || 10)),
    hasPreviousPage: (query.page || 1) > 1,
  };

  const summary = {
    notificationsCount: results.length,
  };
    return { data: results, meta, summary };
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
