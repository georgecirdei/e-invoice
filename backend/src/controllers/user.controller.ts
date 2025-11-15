import { Request, Response } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
} from '../services/user.service';
import { z } from 'zod';
import logger from '../utils/logger';

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

/**
 * Get current user profile
 * GET /api/v1/users/profile
 */
export async function getProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const profile = await getUserProfile(userId);

    res.status(200).json({
      success: true,
      data: { user: profile },
    });
  } catch (error: any) {
    logger.error('Get profile error:', error);

    res.status(404).json({
      success: false,
      message: error.message || 'Failed to get profile',
    });
  }
}

/**
 * Update user profile
 * PUT /api/v1/users/profile
 */
export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const validatedData = updateProfileSchema.parse(req.body);

    const user = await updateUserProfile(userId, validatedData);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error: any) {
    logger.error('Update profile error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
}

/**
 * Change password
 * POST /api/v1/users/change-password
 */
export async function changeUserPassword(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const validatedData = changePasswordSchema.parse(req.body);

    const result = await changePassword(
      userId,
      validatedData.currentPassword,
      validatedData.newPassword
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Change password error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to change password',
    });
  }
}

/**
 * Delete user account
 * DELETE /api/v1/users/account
 */
export async function deleteAccount(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account',
      });
    }

    const result = await deleteUserAccount(userId, password);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Delete account error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete account',
    });
  }
}

