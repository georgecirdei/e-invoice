/**
 * Government API response types
 */

export interface GovernmentAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface GovernmentSubmissionRequest {
  invoiceNumber: string;
  invoiceData: string; // XML or JSON based on provider
  documentType: string;
  issueDate: string;
  totalAmount: number;
  currency: string;
}

export interface GovernmentSubmissionResponse {
  success: boolean;
  submissionId: string;
  governmentId?: string;
  status: 'SUBMITTED' | 'VALIDATED' | 'REJECTED';
  message?: string;
  validationErrors?: string[];
  submittedAt: string;
}

export interface GovernmentStatusResponse {
  governmentId: string;
  status: 'SUBMITTED' | 'VALIDATED' | 'REJECTED' | 'PENDING';
  validatedAt?: string;
  rejectionReason?: string;
  validationErrors?: string[];
}

export interface GovernmentValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

export interface SubmissionHistory {
  id: string;
  invoiceId: string;
  submissionId: string;
  governmentId: string | null;
  status: string;
  request: any;
  response: any;
  errors: string[] | null;
  submittedAt: Date;
  validatedAt: Date | null;
}

