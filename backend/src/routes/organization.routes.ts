import { Router } from 'express';
import {
  create,
  getById,
  getMyOrganization,
  update,
  getAll,
  addMember,
  removeMember,
  updateMemberRole,
} from '../controllers/organization.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/organizations/me
 * @desc    Get current user's organization
 * @access  Private
 */
router.get('/me', getMyOrganization);

/**
 * @route   POST /api/v1/organizations
 * @desc    Create a new organization
 * @access  Private
 */
router.post('/', create);

/**
 * @route   GET /api/v1/organizations
 * @desc    Get all organizations (admin only)
 * @access  Private (Admin)
 */
router.get('/', authorize('ADMIN'), getAll);

/**
 * @route   GET /api/v1/organizations/:id
 * @desc    Get organization by ID
 * @access  Private
 */
router.get('/:id', getById);

/**
 * @route   PUT /api/v1/organizations/:id
 * @desc    Update organization
 * @access  Private (Admin only)
 */
router.put('/:id', update);

/**
 * @route   POST /api/v1/organizations/:id/members
 * @desc    Add user to organization
 * @access  Private (Admin only)
 */
router.post('/:id/members', addMember);

/**
 * @route   DELETE /api/v1/organizations/:id/members/:userId
 * @desc    Remove user from organization
 * @access  Private (Admin only)
 */
router.delete('/:id/members/:userId', removeMember);

/**
 * @route   PATCH /api/v1/organizations/:id/members/:userId/role
 * @desc    Update user role in organization
 * @access  Private (Admin only)
 */
router.patch('/:id/members/:userId/role', updateMemberRole);

export default router;

