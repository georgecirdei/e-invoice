import apiClient from '@/lib/api';

export interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string | null;
  notes: string | null;
  invoiceId: string;
  createdAt: string;
}

export interface PaymentStats {
  totalInvoices: number;
  paidInvoices: number;
  partiallyPaid: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  outstandingAmount: number;
}

export interface RecordPaymentData {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

export const paymentService = {
  /**
   * Record payment for invoice
   */
  async recordPayment(invoiceId: string, data: RecordPaymentData): Promise<Payment> {
    const response = await apiClient.post(`/invoices/${invoiceId}/payments`, data);
    return response.data.data.payment;
  },

  /**
   * Get payments for invoice
   */
  async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    const response = await apiClient.get(`/invoices/${invoiceId}/payments`);
    return response.data.data.payments;
  },

  /**
   * Delete payment
   */
  async deletePayment(paymentId: string): Promise<void> {
    await apiClient.delete(`/payments/${paymentId}`);
  },

  /**
   * Get payment statistics
   */
  async getPaymentStats(): Promise<PaymentStats> {
    const response = await apiClient.get('/payments/stats');
    return response.data.data.stats;
  },

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices() {
    const response = await apiClient.get('/payments/overdue');
    return response.data.data.invoices;
  },
};

