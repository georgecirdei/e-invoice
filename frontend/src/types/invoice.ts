export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  invoiceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  status: InvoiceStatus;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string | null;
  pdfUrl: string | null;
  xmlData: string | null;
  qrCode: string | null;
  submittedAt: string | null;
  validatedAt: string | null;
  governmentId: string | null;
  governmentStatus: string | null;
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  paidAmount: number;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  customerId: string;
  createdById: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    taxId: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string;
    postalCode: string | null;
  };
  lineItems?: InvoiceLineItem[];
  createdBy?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  _count?: {
    lineItems: number;
  };
}

export type InvoiceStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SUBMITTED'
  | 'VALIDATED'
  | 'REJECTED'
  | 'CANCELLED';

export interface CreateInvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface CreateInvoiceData {
  customerId: string;
  invoiceDate: string;
  dueDate?: string;
  currency?: string;
  notes?: string;
  lineItems: CreateInvoiceLineItem[];
}

export interface UpdateInvoiceData {
  customerId?: string;
  invoiceDate?: string;
  dueDate?: string;
  currency?: string;
  notes?: string;
  status?: InvoiceStatus;
  lineItems?: CreateInvoiceLineItem[];
}

export interface InvoiceStats {
  total: number;
  draft: number;
  submitted: number;
  validated: number;
  rejected: number;
  totalAmount: number;
}

