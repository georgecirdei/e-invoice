import { Router } from 'express';
import {
  getStats,
  getCountries,
  getCountry,
  createCountryConfig,
  updateCountryConfig,
  deleteCountryConfig,
  getUsers,
  getOrganizations,
  createRule,
  getRules,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireSuperAdmin } from '../middleware/admin.middleware';

const router = Router();

// All routes require authentication AND Super Admin role
router.use(authenticate);
router.use(requireSuperAdmin);

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get system statistics
 * @access  Super Admin only
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users
 * @access  Super Admin only
 */
router.get('/users', getUsers);

/**
 * @route   GET /api/v1/admin/organizations
 * @desc    Get all organizations
 * @access  Super Admin only
 */
router.get('/organizations', getOrganizations);

/**
 * @route   GET /api/v1/admin/countries
 * @desc    Get all country configurations
 * @access  Super Admin only
 */
router.get('/countries', getCountries);

/**
 * @route   POST /api/v1/admin/countries
 * @desc    Create country configuration
 * @access  Super Admin only
 */
router.post('/countries', createCountryConfig);

/**
 * @route   GET /api/v1/admin/countries/:id
 * @desc    Get country configuration by ID
 * @access  Super Admin only
 */
router.get('/countries/:id', getCountry);

/**
 * @route   PUT /api/v1/admin/countries/:id
 * @desc    Update country configuration
 * @access  Super Admin only
 */
router.put('/countries/:id', updateCountryConfig);

/**
 * @route   DELETE /api/v1/admin/countries/:id
 * @desc    Delete country configuration
 * @access  Super Admin only
 */
router.delete('/countries/:id', deleteCountryConfig);

/**
 * @route   GET /api/v1/admin/countries/:id/rules
 * @desc    Get compliance rules for country
 * @access  Super Admin only
 */
router.get('/countries/:id/rules', getRules);

/**
 * @route   POST /api/v1/admin/countries/:id/rules
 * @desc    Create compliance rule
 * @access  Super Admin only
 */
router.post('/countries/:id/rules', createRule);

export default router;

