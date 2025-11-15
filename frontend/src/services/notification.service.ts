import apiClient from '@/lib/api';
import type {
  Notification,
  NotificationListResponse,
  UnreadCountResponse,
  GetNotificationsParams,
} from '@/types/notification';

export const notificationService = {
  /**
   * Get notifications with pagination and filters
   */
  async getAll(params: GetNotificationsParams = {}): Promise<NotificationListResponse> {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data.count;
  },

  /**
   * Get a single notification by ID
   */
  async getById(id: string): Promise<Notification> {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.post(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; count: number; message: string }> {
    const response = await apiClient.post('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a notification
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<{ success: boolean; count: number; message: string }> {
    const response = await apiClient.delete('/notifications/read');
    return response.data;
  },
};

