import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getVapidPublicKey,
  subscribePush,
  unsubscribePush
} from '../Controllers/notification.controller.js';
import authMiddleware from '../Middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

// get notifications
router.get('/', getNotifications);
// get unread count
router.get('/unread-count', getUnreadCount);
// mark all as read
router.patch('/read-all', markAllAsRead);
// mark as read
router.patch('/:id/read', markAsRead);
// delete notification
router.delete('/:id', deleteNotification);

// Web Push
router.get('/vapid-public-key', getVapidPublicKey);
// subscribe push
router.post('/subscribe', subscribePush);
// unsubscribe push
router.post('/unsubscribe', unsubscribePush);

export default router;
