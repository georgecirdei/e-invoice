import { Router } from 'express';
import {
  create,
  getById,
  getAll,
  update,
  remove,
  getStats,
} from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/customers/stats
 * @desc    Get customer statistics
 * @access  Private
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/v1/customers
 * @desc    Get all customers for organization
 * @access  Private
 */
router.get('/', getAll);

/**
 * @route   POST /api/v1/customers
 * @desc    Create a new customer
 * @access  Private
 */
router.post('/', create);

/**
 * @route   GET /api/v1/customers/:id
 * @desc    Get customer by ID
 * @access  Private
 */
router.get('/:id', getById);

/**
 * @route   PUT /api/v1/customers/:id
 * @desc    Update customer
 * @access  Private
 */
router.put('/:id', update);

/**
 * @route   DELETE /api/v1/customers/:id
 * @desc    Delete customer
 * @access  Private
 */
router.delete('/:id', remove);

export default router;

