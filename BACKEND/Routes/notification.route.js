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

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Web Push
router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', subscribePush);
router.post('/unsubscribe', unsubscribePush);

export default router;
