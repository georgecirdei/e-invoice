import { z } from 'zod';

/**
 * Line item validation schema
 */
export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  taxRate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100'),
});

/**
 * Create invoice validation schema
 */
export const createInvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  invoiceDate: z.string().or(z.date()),
  dueDate: z.string().or(z.date()).optional(),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
  lineItems: z
    .array(lineItemSchema)
    .min(1, 'At least one line item is required')
    .max(100, 'Maximum 100 line items allowed'),
});

/**
 * Update invoice validation schema
 */
export const updateInvoiceSchema = z.object({
  customerId: z.string().min(1).optional(),
  invoiceDate: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()).optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
  status: z
    .enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SUBMITTED', 'VALIDATED', 'REJECTED', 'CANCELLED'])
    .optional(),
  lineItems: z.array(lineItemSchema).min(1).max(100).optional(),
});

/**
 * Submit invoice validation schema
 */
export const submitInvoiceSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
});

export type LineItemInput = z.infer<typeof lineItemSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type SubmitInvoiceInput = z.infer<typeof submitInvoiceSchema>;

