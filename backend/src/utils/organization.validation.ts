import { z } from 'zod';

/**
 * Validation schema for creating organization
 */
export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  taxId: z.string().min(3, 'Tax ID is required'),
  registrationNumber: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().optional(),
});

/**
 * Validation schema for updating organization
 */
export const updateOrganizationSchema = z.object({
  name: z.string().min(2).optional(),
  taxId: z.string().min(3).optional(),
  registrationNumber: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().min(2).optional(),
  postalCode: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Validation schema for adding user to organization
 */
export const addUserToOrgSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
});

/**
 * Validation schema for updating user role
 */
export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type AddUserToOrgInput = z.infer<typeof addUserToOrgSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

