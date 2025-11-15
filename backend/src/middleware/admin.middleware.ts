import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Middleware to check if user is Super Admin
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  if (user.role !== 'SUPER_ADMIN') {
    logger.warn(`Access denied to admin area for user: ${user.email} (role: ${user.role})`);
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin privileges required.',
    });
  }

  next();
}

