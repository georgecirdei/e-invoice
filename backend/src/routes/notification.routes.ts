import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user
 * Query params: page, limit, isRead, type
 */
router.get('/', notificationController.getNotifications);

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * GET /api/notifications/:id
 * Get a single notification by ID
 */
router.get('/:id', notificationController.getNotification);

/**
 * POST /api/notifications/:id/read
 * Mark a notification as read
 */
router.post('/:id/read', notificationController.markAsRead);

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read
 */
router.post('/read-all', notificationController.markAllAsRead);

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', notificationController.deleteNotification);

/**
 * DELETE /api/notifications/read
 * Delete all read notifications
 */
router.delete('/read', notificationController.deleteAllRead);

export default router;

