import apiClient from '@/lib/api';

export interface ComplianceStats {
  submitted: number;
  validated: number;
  rejected: number;
  pending: number;
  complianceRate: number;
}

export interface SubmissionHistory {
  invoice: {
    id: string;
    invoiceNumber: string;
    governmentId: string | null;
    governmentStatus: string | null;
    submittedAt: string | null;
    validatedAt: string | null;
    status: string;
  };
  submissions: Array<{
    submissionId: string;
    governmentId: string;
    status: string;
    submittedAt: string;
    validatedAt: string | null;
  }>;
}

export const complianceService = {
  /**
   * Submit invoice to government
   */
  async submitToGovernment(invoiceId: string) {
    const response = await apiClient.post(`/compliance/submit/${invoiceId}`);
    return response.data;
  },

  /**
   * Check invoice status with government
   */
  async checkStatus(invoiceId: string) {
    const response = await apiClient.get(`/compliance/status/${invoiceId}`);
    return response.data.data.status;
  },

  /**
   * Retry failed submission
   */
  async retrySubmission(invoiceId: string) {
    const response = await apiClient.post(`/compliance/retry/${invoiceId}`);
    return response.data;
  },

  /**
   * Get submission history
   */
  async getHistory(invoiceId: string): Promise<SubmissionHistory> {
    const response = await apiClient.get(`/compliance/history/${invoiceId}`);
    return response.data.data;
  },

  /**
   * Get compliance statistics
   */
  async getStats(): Promise<ComplianceStats> {
    const response = await apiClient.get('/compliance/stats');
    return response.data.data.stats;
  },
};

