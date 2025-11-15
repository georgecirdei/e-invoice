import prisma from '../config/database';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiration,
} from '../utils/auth';
import {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
} from '../utils/validation';
import logger from '../utils/logger';

/**
 * Register a new user
 */
export async function registerUser(data: RegisterInput) {
  const { email, password, firstName, lastName } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash the password
  const hashedPassword = await hashPassword(password);

  // Create the user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  logger.info(`New user registered: ${email}`);

  return user;
}

/**
 * Login user
 */
export async function loginUser(data: LoginInput) {
  const { email, password } = data;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Account is inactive. Please contact support.');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken();
  const refreshTokenExpiry = getRefreshTokenExpiration();

  // Save refresh token to database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiry,
    },
  });

  logger.info(`User logged in: ${email}`);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(data: RefreshTokenInput) {
  const { refreshToken } = data;

  // Find refresh token in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new Error('Invalid refresh token');
  }

  // Check if token is expired
  if (new Date() > storedToken.expiresAt) {
    // Delete expired token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });
    throw new Error('Refresh token has expired');
  }

  // Check if user is still active
  if (!storedToken.user.isActive) {
    throw new Error('Account is inactive');
  }

  // Generate new access token
  const accessToken = generateAccessToken({
    userId: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role,
  });

  logger.info(`Access token refreshed for user: ${storedToken.user.email}`);

  return {
    accessToken,
    user: {
      id: storedToken.user.id,
      email: storedToken.user.email,
      firstName: storedToken.user.firstName,
      lastName: storedToken.user.lastName,
      role: storedToken.user.role,
    },
  };
}

/**
 * Logout user (invalidate refresh token)
 */
export async function logoutUser(refreshToken: string) {
  // Delete the refresh token
  const deleted = await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });

  if (deleted.count === 0) {
    throw new Error('Refresh token not found');
  }

  logger.info('User logged out');

  return { message: 'Logged out successfully' };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

