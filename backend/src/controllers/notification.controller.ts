import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { NotificationType } from '@prisma/client';

export const notificationController = {
  /**
   * GET /api/notifications
   * Get notifications for the authenticated user
   */
  async getNotifications(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
      const type = req.query.type as NotificationType | undefined;

      const result = await notificationService.getByUserId(userId, {
        page,
        limit,
        isRead,
        type,
      });

      res.json(result);
    } catch (error: any) {
      console.error('Error in getNotifications:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch notifications' });
    }
  },

  /**
   * GET /api/notifications/unread-count
   * Get unread notification count
   */
  async getUnreadCount(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const count = await notificationService.getUnreadCount(userId);

      res.json({ count });
    } catch (error: any) {
      console.error('Error in getUnreadCount:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch unread count' });
    }
  },

  /**
   * GET /api/notifications/:id
   * Get a single notification
   */
  async getNotification(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const notification = await notificationService.getById(id, userId);

      res.json(notification);
    } catch (error: any) {
      console.error('Error in getNotification:', error);
      
      if (error.message === 'Notification not found') {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: error.message || 'Failed to fetch notification' });
    }
  },

  /**
   * POST /api/notifications/:id/read
   * Mark a notification as read
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const notification = await notificationService.markAsRead(id, userId);

      res.json(notification);
    } catch (error: any) {
      console.error('Error in markAsRead:', error);

      if (error.message === 'Notification not found') {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: error.message || 'Failed to mark as read' });
    }
  },

  /**
   * POST /api/notifications/read-all
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        count: result.count,
        message: `${result.count} notification${result.count !== 1 ? 's' : ''} marked as read`,
      });
    } catch (error: any) {
      console.error('Error in markAllAsRead:', error);
      res.status(500).json({ message: error.message || 'Failed to mark all as read' });
    }
  },

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  async deleteNotification(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await notificationService.delete(id, userId);

      res.json({ success: true, message: 'Notification deleted' });
    } catch (error: any) {
      console.error('Error in deleteNotification:', error);

      if (error.message === 'Notification not found') {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: error.message || 'Failed to delete notification' });
    }
  },

  /**
   * DELETE /api/notifications/read
   * Delete all read notifications
   */
  async deleteAllRead(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await notificationService.deleteAllRead(userId);

      res.json({
        success: true,
        count: result.count,
        message: `${result.count} notification${result.count !== 1 ? 's' : ''} deleted`,
      });
    } catch (error: any) {
      console.error('Error in deleteAllRead:', error);
      res.status(500).json({ message: error.message || 'Failed to delete notifications' });
    }
  },
};

