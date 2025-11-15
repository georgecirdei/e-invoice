import { Request, Response } from 'express';
import {
  createCustomer,
  getCustomerById,
  getOrganizationCustomers,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
} from '../services/customer.service';
import {
  createCustomerSchema,
  updateCustomerSchema,
} from '../utils/customer.validation';
import logger from '../utils/logger';

/**
 * Create new customer
 * POST /api/v1/customers
 */
export async function create(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    // User must belong to an organization
    const userWithOrg = await (await import('../config/database')).default.user.findUnique({
      where: { id: user.userId },
      select: { organizationId: true },
    });

    if (!userWithOrg?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'You must belong to an organization to create customers',
      });
    }

    const validatedData = createCustomerSchema.parse(req.body);

    const customer = await createCustomer({
      ...validatedData,
      organizationId: userWithOrg.organizationId,
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: { customer },
    });
  } catch (error: any) {
    logger.error('Create customer error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create customer',
    });
  }
}

/**
 * Get customer by ID
 * GET /api/v1/customers/:id
 */
export async function getById(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const userWithOrg = await (await import('../config/database')).default.user.findUnique({
      where: { id: user.userId },
      select: { organizationId: true },
    });

    if (!userWithOrg?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'You must belong to an organization',
      });
    }

    const customer = await getCustomerById(id, userWithOrg.organizationId);

    res.status(200).json({
      success: true,
      data: { customer },
    });
  } catch (error: any) {
    logger.error('Get customer error:', error);

    res.status(404).json({
      success: false,
      message: error.message || 'Customer not found',
    });
  }
}

/**
 * Get all customers for organization
 * GET /api/v1/customers
 */
export async function getAll(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const country = req.query.country as string;

    const userWithOrg = await (await import('../config/database')).default.user.findUnique({
      where: { id: user.userId },
      select: { organizationId: true },
    });

    if (!userWithOrg?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'You must belong to an organization',
      });
    }

    const result = await getOrganizationCustomers(
      userWithOrg.organizationId,
      { search, isActive, country },
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Get customers error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get customers',
    });
  }
}

/**
 * Update customer
 * PUT /api/v1/customers/:id
 */
export async function update(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const userWithOrg = await (await import('../config/database')).default.user.findUnique({
      where: { id: user.userId },
      select: { organizationId: true },
    });

    if (!userWithOrg?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'You must belong to an organization',
      });
    }

    const validatedData = updateCustomerSchema.parse(req.body);

    const customer = await updateCustomer(id, userWithOrg.organizationId, validatedData);

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: { customer },
    });
  } catch (error: any) {
    logger.error('Update customer error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update customer',
    });
  }
}

/**
 * Delete customer
 * DELETE /api/v1/customers/:id
 */
export async function remove(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const userWithOrg = await (await import('../config/database')).default.user.findUnique({
      where: { id: user.userId },
      select: { organizationId: true },
    });

    if (!userWithOrg?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'You must belong to an organization',
      });
    }

    const result = await deleteCustomer(id, userWithOrg.organizationId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Delete customer error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete customer',
    });
  }
}

/**
 * Get customer statistics
 * GET /api/v1/customers/stats
 */
export async function getStats(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    const userWithOrg = await (await import('../config/database')).default.user.findUnique({
      where: { id: user.userId },
      select: { organizationId: true },
    });

    if (!userWithOrg?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'You must belong to an organization',
      });
    }

    const stats = await getCustomerStats(userWithOrg.organizationId);

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error: any) {
    logger.error('Get customer stats error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get customer statistics',
    });
  }
}

