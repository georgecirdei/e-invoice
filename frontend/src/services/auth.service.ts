import apiClient from '@/lib/api';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '@/types/auth';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<{ user: User }> {
    const response = await apiClient.post('/auth/register', data);
    return response.data.data;
  },

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse['data']> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data.data;
  },

  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data.data.user;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },
};

