import apiClient from '@/lib/api';
import type { User } from '@/types/auth';

export const userService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get('/users/profile');
    return response.data.data.user;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<User> {
    const response = await apiClient.put('/users/profile', data);
    return response.data.data.user;
  },

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiClient.post('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<void> {
    await apiClient.delete('/users/account', {
      data: { password },
    });
  },
};

