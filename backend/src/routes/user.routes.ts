import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changeUserPassword,
  deleteAccount,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', updateProfile);

/**
 * @route   POST /api/v1/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', changeUserPassword);

/**
 * @route   DELETE /api/v1/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', deleteAccount);

export default router;

