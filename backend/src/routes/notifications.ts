import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as notificationController from '../controllers/notificationController';

const router = Router();

/**
 * Notification routes
 */

// Get notifications for authenticated agent
router.get('/notifications', authenticate, notificationController.getNotifications);

// Get unread notification count
router.get(
  '/notifications/unread-count',
  authenticate,
  notificationController.getUnreadCount
);

// Mark all notifications as read
router.patch(
  '/notifications/read-all',
  authenticate,
  notificationController.markAllAsRead
);

// Mark a notification as read
router.patch('/notifications/:id/read', authenticate, notificationController.markAsRead);

// Delete a notification
router.delete('/notifications/:id', authenticate, notificationController.deleteNotification);

export default router;
