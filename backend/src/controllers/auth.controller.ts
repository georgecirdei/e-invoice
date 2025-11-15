import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserById,
} from '../services/auth.service';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../utils/validation';
import logger from '../utils/logger';

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export async function register(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);

    // Register user
    const user = await registerUser(validatedData);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user },
    });
  } catch (error: any) {
    logger.error('Registration error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
}

/**
 * Login user
 * POST /api/v1/auth/login
 */
export async function login(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Login user
    const result = await loginUser(validatedData);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    logger.error('Login error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(401).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
}

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export async function refresh(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = refreshTokenSchema.parse(req.body);

    // Refresh token
    const result = await refreshAccessToken(validatedData);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    });
  } catch (error: any) {
    logger.error('Token refresh error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(401).json({
      success: false,
      message: error.message || 'Token refresh failed',
    });
  }
}

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Logout user
    const result = await logoutUser(refreshToken);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Logout error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Logout failed',
    });
  }
}

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
export async function getMe(req: Request, res: Response) {
  try {
    // User ID comes from auth middleware
    const userId = (req as any).user.userId;

    const user = await getUserById(userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    logger.error('Get user error:', error);

    res.status(404).json({
      success: false,
      message: error.message || 'User not found',
    });
  }
}

