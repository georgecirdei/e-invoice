import { Request, Response } from 'express';
import {
  createOrganization,
  getOrganizationById,
  getUserOrganization,
  updateOrganization,
  getAllOrganizations,
  addUserToOrganization,
  removeUserFromOrganization,
  updateUserRole,
} from '../services/organization.service';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  addUserToOrgSchema,
  updateUserRoleSchema,
} from '../utils/organization.validation';
import logger from '../utils/logger';

/**
 * Create new organization
 * POST /api/v1/organizations
 */
export async function create(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const validatedData = createOrganizationSchema.parse(req.body);

    const organization = await createOrganization({
      ...validatedData,
      userId,
    });

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: { organization },
    });
  } catch (error: any) {
    logger.error('Create organization error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create organization',
    });
  }
}

/**
 * Get organization by ID
 * GET /api/v1/organizations/:id
 */
export async function getById(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const organization = await getOrganizationById(id, userId);

    res.status(200).json({
      success: true,
      data: { organization },
    });
  } catch (error: any) {
    logger.error('Get organization error:', error);

    res.status(404).json({
      success: false,
      message: error.message || 'Organization not found',
    });
  }
}

/**
 * Get current user's organization
 * GET /api/v1/organizations/me
 */
export async function getMyOrganization(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;

    const organization = await getUserOrganization(userId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'You are not part of any organization',
      });
    }

    res.status(200).json({
      success: true,
      data: { organization },
    });
  } catch (error: any) {
    logger.error('Get user organization error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get organization',
    });
  }
}

/**
 * Update organization
 * PUT /api/v1/organizations/:id
 */
export async function update(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const validatedData = updateOrganizationSchema.parse(req.body);

    const organization = await updateOrganization(id, userId, validatedData);

    res.status(200).json({
      success: true,
      message: 'Organization updated successfully',
      data: { organization },
    });
  } catch (error: any) {
    logger.error('Update organization error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update organization',
    });
  }
}

/**
 * Get all organizations (admin only)
 * GET /api/v1/organizations
 */
export async function getAll(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAllOrganizations(page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Get all organizations error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get organizations',
    });
  }
}

/**
 * Add user to organization
 * POST /api/v1/organizations/:id/members
 */
export async function addMember(req: Request, res: Response) {
  try {
    const adminUserId = (req as any).user.userId;
    const { id: organizationId } = req.params;
    const validatedData = addUserToOrgSchema.parse(req.body);

    const user = await addUserToOrganization(
      organizationId,
      validatedData.email,
      validatedData.role,
      adminUserId
    );

    res.status(201).json({
      success: true,
      message: 'User added to organization successfully',
      data: { user },
    });
  } catch (error: any) {
    logger.error('Add member error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add user to organization',
    });
  }
}

/**
 * Remove user from organization
 * DELETE /api/v1/organizations/:id/members/:userId
 */
export async function removeMember(req: Request, res: Response) {
  try {
    const adminUserId = (req as any).user.userId;
    const { id: organizationId, userId } = req.params;

    await removeUserFromOrganization(organizationId, userId, adminUserId);

    res.status(200).json({
      success: true,
      message: 'User removed from organization successfully',
    });
  } catch (error: any) {
    logger.error('Remove member error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to remove user from organization',
    });
  }
}

/**
 * Update user role in organization
 * PATCH /api/v1/organizations/:id/members/:userId/role
 */
export async function updateMemberRole(req: Request, res: Response) {
  try {
    const adminUserId = (req as any).user.userId;
    const { id: organizationId, userId } = req.params;
    const validatedData = updateUserRoleSchema.parse({ ...req.body, userId });

    const user = await updateUserRole(
      organizationId,
      userId,
      validatedData.role,
      adminUserId
    );

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { user },
    });
  } catch (error: any) {
    logger.error('Update member role error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update user role',
    });
  }
}

