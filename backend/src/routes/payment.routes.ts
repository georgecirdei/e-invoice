import { Router } from 'express';
import {
  removePayment,
  getStats,
  getOverdue,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/payments/stats
 * @desc    Get payment statistics
 * @access  Private
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/v1/payments/overdue
 * @desc    Get overdue invoices
 * @access  Private
 */
router.get('/overdue', getOverdue);

/**
 * @route   DELETE /api/v1/payments/:id
 * @desc    Delete payment
 * @access  Private
 */
router.delete('/:id', removePayment);

export default router;

