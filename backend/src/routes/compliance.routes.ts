import { Router } from 'express';
import {
  submitInvoice,
  checkStatus,
  retry,
  getHistory,
  getStats,
} from '../controllers/compliance.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/compliance/stats
 * @desc    Get compliance statistics
 * @access  Private
 */
router.get('/stats', getStats);

/**
 * @route   POST /api/v1/compliance/submit/:id
 * @desc    Submit invoice to government
 * @access  Private
 */
router.post('/submit/:id', submitInvoice);

/**
 * @route   GET /api/v1/compliance/status/:id
 * @desc    Check invoice status with government
 * @access  Private
 */
router.get('/status/:id', checkStatus);

/**
 * @route   POST /api/v1/compliance/retry/:id
 * @desc    Retry failed submission
 * @access  Private
 */
router.post('/retry/:id', retry);

/**
 * @route   GET /api/v1/compliance/history/:id
 * @desc    Get submission history for invoice
 * @access  Private
 */
router.get('/history/:id', getHistory);

export default router;

