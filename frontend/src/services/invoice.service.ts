import apiClient from '@/lib/api';
import type {
  Invoice,
  CreateInvoiceData,
  UpdateInvoiceData,
  InvoiceStats,
} from '@/types/invoice';

export const invoiceService = {
  /**
   * Create a new invoice
   */
  async create(data: CreateInvoiceData): Promise<Invoice> {
    const response = await apiClient.post('/invoices', data);
    return response.data.data.invoice;
  },

  /**
   * Get invoice by ID
   */
  async getById(id: string): Promise<Invoice> {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data.data.invoice;
  },

  /**
   * Get all invoices
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    customerId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    invoices: Invoice[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await apiClient.get('/invoices', { params });
    return response.data.data;
  },

  /**
   * Update invoice
   */
  async update(id: string, data: UpdateInvoiceData): Promise<Invoice> {
    const response = await apiClient.put(`/invoices/${id}`, data);
    return response.data.data.invoice;
  },

  /**
   * Delete invoice
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/invoices/${id}`);
  },

  /**
   * Submit invoice
   */
  async submit(id: string): Promise<Invoice> {
    const response = await apiClient.post(`/invoices/${id}/submit`);
    return response.data.data.invoice;
  },

  /**
   * Get invoice statistics
   */
  async getStats(): Promise<InvoiceStats> {
    const response = await apiClient.get('/invoices/stats');
    return response.data.data.stats;
  },
};

