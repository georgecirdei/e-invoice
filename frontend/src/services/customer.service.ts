import apiClient from '@/lib/api';
import type {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerStats,
} from '@/types/customer';

export const customerService = {
  /**
   * Create a new customer
   */
  async create(data: CreateCustomerData): Promise<Customer> {
    const response = await apiClient.post('/customers', data);
    return response.data.data.customer;
  },

  /**
   * Get customer by ID
   */
  async getById(id: string): Promise<Customer> {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data.data.customer;
  },

  /**
   * Get all customers
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    country?: string;
  }): Promise<{
    customers: Customer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await apiClient.get('/customers', { params });
    return response.data.data;
  },

  /**
   * Update customer
   */
  async update(id: string, data: UpdateCustomerData): Promise<Customer> {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data.data.customer;
  },

  /**
   * Delete customer
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },

  /**
   * Get customer statistics
   */
  async getStats(): Promise<CustomerStats> {
    const response = await apiClient.get('/customers/stats');
    return response.data.data.stats;
  },
};

