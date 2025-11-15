import axios, { AxiosInstance } from 'axios';
import { governmentConfig, getGovernmentEndpoints } from '../config/government';
import logger from '../utils/logger';
import type {
  GovernmentAuthResponse,
  GovernmentSubmissionRequest,
  GovernmentSubmissionResponse,
  GovernmentStatusResponse,
  GovernmentValidationResult,
} from '../types/government';

class GovernmentAPIClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: governmentConfig.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        if (error.response?.status === 401) {
          // Token expired, try to re-authenticate
          this.accessToken = null;
          this.tokenExpiresAt = null;
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Authenticate with government API
   */
  private async authenticate(): Promise<string> {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
        return this.accessToken;
      }

      logger.info('Authenticating with government API...');

      const endpoints = getGovernmentEndpoints();

      // Mock authentication for testing
      if (governmentConfig.provider === 'mock') {
        this.accessToken = 'mock-access-token-' + Date.now();
        this.tokenExpiresAt = Date.now() + 3600000; // 1 hour
        return this.accessToken;
      }

      // Real authentication (MyInvois, ZATCA)
      const response = await this.client.post<GovernmentAuthResponse>(
        endpoints.auth,
        {
          client_id: governmentConfig.clientId,
          client_secret: governmentConfig.clientSecret,
          grant_type: 'client_credentials',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);

      logger.info('Government API authentication successful');

      return this.accessToken as string;
    } catch (error: any) {
      logger.error('Government API authentication error:', error);
      throw new Error('Failed to authenticate with government API');
    }
  }

  /**
   * Submit invoice to government
   */
  async submitInvoice(
    invoiceNumber: string,
    xmlData: string,
    invoiceDate: Date,
    totalAmount: number,
    currency: string
  ): Promise<GovernmentSubmissionResponse> {
    try {
      if (!governmentConfig.enabled) {
        // Mock submission for testing
        return this.mockSubmission(invoiceNumber);
      }

      const token = await this.authenticate();
      const endpoints = getGovernmentEndpoints();

      const requestData: GovernmentSubmissionRequest = {
        invoiceNumber,
        invoiceData: xmlData,
        documentType: '380', // Commercial invoice
        issueDate: invoiceDate.toISOString().split('T')[0],
        totalAmount,
        currency,
      };

      const response = await this.client.post(endpoints.submit, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.info(`Invoice submitted to government: ${invoiceNumber}`);

      return {
        success: true,
        submissionId: response.data.submissionId || response.data.uuid,
        governmentId: response.data.governmentId || response.data.invoiceHash,
        status: response.data.status || 'SUBMITTED',
        message: response.data.message,
        submittedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error('Government submission error:', error);

      return {
        success: false,
        submissionId: 'failed-' + Date.now(),
        status: 'REJECTED',
        message: error.response?.data?.message || 'Submission failed',
        validationErrors: error.response?.data?.errors || [error.message],
        submittedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Check invoice status with government
   */
  async checkInvoiceStatus(governmentId: string): Promise<GovernmentStatusResponse> {
    try {
      if (!governmentConfig.enabled) {
        return this.mockStatusCheck(governmentId);
      }

      const token = await this.authenticate();
      const endpoints = getGovernmentEndpoints();

      const response = await this.client.get(`${endpoints.status}/${governmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        governmentId,
        status: response.data.status || 'PENDING',
        validatedAt: response.data.validatedAt,
        rejectionReason: response.data.rejectionReason,
        validationErrors: response.data.errors,
      };
    } catch (error: any) {
      logger.error('Government status check error:', error);
      throw new Error('Failed to check invoice status');
    }
  }

  /**
   * Validate invoice before submission
   */
  async validateInvoice(xmlData: string): Promise<GovernmentValidationResult> {
    try {
      if (!governmentConfig.enabled) {
        return this.mockValidation();
      }

      const token = await this.authenticate();
      const endpoints = getGovernmentEndpoints();

      const response = await this.client.post(
        endpoints.validate,
        { documentData: xmlData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        isValid: response.data.isValid !== false,
        errors: response.data.errors || [],
        warnings: response.data.warnings || [],
      };
    } catch (error: any) {
      logger.error('Government validation error:', error);
      
      return {
        isValid: false,
        errors: [
          {
            field: 'general',
            message: error.response?.data?.message || 'Validation failed',
          },
        ],
        warnings: [],
      };
    }
  }

  /**
   * Mock submission for testing (when government API not configured)
   */
  private mockSubmission(invoiceNumber: string): GovernmentSubmissionResponse {
    const isSuccess = Math.random() > 0.1; // 90% success rate for testing

    return {
      success: isSuccess,
      submissionId: 'MOCK-' + Date.now(),
      governmentId: isSuccess ? 'GOV-' + invoiceNumber : undefined,
      status: isSuccess ? 'VALIDATED' : 'REJECTED',
      message: isSuccess
        ? 'Invoice validated successfully (MOCK)'
        : 'Invoice rejected for testing purposes (MOCK)',
      validationErrors: isSuccess ? undefined : ['Mock validation error for testing'],
      submittedAt: new Date().toISOString(),
    };
  }

  /**
   * Mock status check for testing
   */
  private mockStatusCheck(governmentId: string): GovernmentStatusResponse {
    return {
      governmentId,
      status: 'VALIDATED',
      validatedAt: new Date().toISOString(),
    };
  }

  /**
   * Mock validation for testing
   */
  private mockValidation(): GovernmentValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
    };
  }
}

// Export singleton instance
export const governmentAPI = new GovernmentAPIClient();

