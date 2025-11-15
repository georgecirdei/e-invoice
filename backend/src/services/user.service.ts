import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/auth';
import logger from '../utils/logger';

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      organization: {
        select: {
          id: true,
          name: true,
          taxId: true,
          email: true,
          country: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }
) {
  // If email is being changed, check it's unique
  if (data.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new Error('Email already in use by another user');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.email && { email: data.email, emailVerified: null }), // Re-verify email if changed
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  logger.info(`User profile updated: ${user.email}`);

  return user;
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Check new password is different
  if (currentPassword === newPassword) {
    throw new Error('New password must be different from current password');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Invalidate all refresh tokens for security
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  logger.info(`Password changed for user: ${user.email}`);

  return { message: 'Password changed successfully. Please login again.' };
}

/**
 * Delete user account
 */
export async function deleteUserAccount(userId: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Password is incorrect');
  }

  // Prevent Super Admin from deleting themselves
  if (user.role === 'SUPER_ADMIN') {
    throw new Error('Super Admin account cannot be deleted');
  }

  // Delete user (cascading deletes will handle related data)
  await prisma.user.delete({
    where: { id: userId },
  });

  logger.info(`User account deleted: ${user.email}`);

  return { message: 'Account deleted successfully' };
}

