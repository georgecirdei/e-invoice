import { PrismaClient, NotificationType, NotificationPriority } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  priority?: NotificationPriority;
  metadata?: any;
}

export interface GetNotificationsQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}

export const notificationService = {
  /**
   * Create a new notification
   */
  async create(data: CreateNotificationDto) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          link: data.link,
          priority: data.priority || 'MEDIUM',
          metadata: data.metadata || null,
        },
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  },

  /**
   * Get notifications for a user
   */
  async getByUserId(userId: string, query: GetNotificationsQuery = {}) {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = { userId };

      if (query.isRead !== undefined) {
        where.isRead = query.isRead;
      }

      if (query.type) {
        where.type = query.type;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.notification.count({ where }),
      ]);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  },

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw new Error('Failed to fetch unread count');
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string, userId: string) {
    try {
      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      return updated;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return result;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw new Error('Failed to mark all as read');
    }
  },

  /**
   * Delete a notification
   */
  async delete(id: string, userId: string) {
    try {
      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await prisma.notification.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  /**
   * Delete all read notifications for a user
   */
  async deleteAllRead(userId: string) {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          userId,
          isRead: true,
        },
      });

      return result;
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      throw new Error('Failed to delete read notifications');
    }
  },

  /**
   * Get a single notification by ID
   */
  async getById(id: string, userId: string) {
    try {
      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  /**
   * Helper: Create invoice notification
   */
  async notifyInvoiceCreated(userId: string, invoiceNumber: string, invoiceId: string) {
    return this.create({
      userId,
      type: 'INVOICE_CREATED',
      title: 'Invoice Created',
      message: `Invoice ${invoiceNumber} has been created successfully.`,
      link: `/invoices/${invoiceId}`,
      priority: 'MEDIUM',
      metadata: { invoiceId, invoiceNumber },
    });
  },

  /**
   * Helper: Create invoice validated notification
   */
  async notifyInvoiceValidated(userId: string, invoiceNumber: string, invoiceId: string) {
    return this.create({
      userId,
      type: 'INVOICE_VALIDATED',
      title: 'Invoice Validated',
      message: `Invoice ${invoiceNumber} has been validated by the government.`,
      link: `/invoices/${invoiceId}`,
      priority: 'HIGH',
      metadata: { invoiceId, invoiceNumber },
    });
  },

  /**
   * Helper: Create invoice rejected notification
   */
  async notifyInvoiceRejected(userId: string, invoiceNumber: string, invoiceId: string, reason?: string) {
    return this.create({
      userId,
      type: 'INVOICE_REJECTED',
      title: 'Invoice Rejected',
      message: `Invoice ${invoiceNumber} was rejected by the government.${reason ? ` Reason: ${reason}` : ''}`,
      link: `/invoices/${invoiceId}`,
      priority: 'URGENT',
      metadata: { invoiceId, invoiceNumber, reason },
    });
  },

  /**
   * Helper: Create payment received notification
   */
  async notifyPaymentReceived(userId: string, amount: number, invoiceNumber: string, invoiceId: string) {
    return this.create({
      userId,
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Received',
      message: `Payment of $${amount.toFixed(2)} received for invoice ${invoiceNumber}.`,
      link: `/invoices/${invoiceId}`,
      priority: 'MEDIUM',
      metadata: { invoiceId, invoiceNumber, amount },
    });
  },

  /**
   * Helper: Create payment overdue notification
   */
  async notifyPaymentOverdue(userId: string, invoiceNumber: string, invoiceId: string, daysOverdue: number, amount: number) {
    return this.create({
      userId,
      type: 'PAYMENT_OVERDUE',
      title: 'Payment Overdue',
      message: `Invoice ${invoiceNumber} is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue. Amount: $${amount.toFixed(2)}`,
      link: `/invoices/${invoiceId}`,
      priority: 'URGENT',
      metadata: { invoiceId, invoiceNumber, daysOverdue, amount },
    });
  },
};

