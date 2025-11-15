import { z } from 'zod';

/**
 * Validation schema for creating customer
 */
export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().optional(),
});

/**
 * Validation schema for updating customer
 */
export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().min(2).optional(),
  postalCode: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

