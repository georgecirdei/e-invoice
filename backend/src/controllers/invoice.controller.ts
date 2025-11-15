import { Request, Response } from 'express';
import {
  createInvoice,
  getInvoiceById,
  getOrganizationInvoices,
  updateInvoice,
  deleteInvoice,
  submitInvoice,
  getInvoiceStats,
} from '../services/invoice.service';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
} from '../utils/invoice.validation';
import logger from '../utils/logger';

/**
 * Create new invoice
 * POST /api/v1/invoices
 */
export async function create(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    const userWithOrg = await (await import('../config/database')).default.user.findUnique({
      where: { id: user.userId },
      select: { organizationId: true },
    });

    if (!userWithOrg?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'You must belong to an organization to create invoices',
      });
    }

    const validatedData = createInvoiceSchema.parse(req.body);

    const invoice = await createInvoice({
      ...validatedData,
      organizationId: userWithOrg.organizationId,
      createdById: user.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: { invoice },
    });
  } catch (error: any) {
    logger.error('Create invoice error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create invoice',
    });
  }
}

/**
 * Get invoice by ID
 * GET /api/v1/invoices/:id
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

    const invoice = await getInvoiceById(id, userWithOrg.organizationId);

    res.status(200).json({
      success: true,
      data: { invoice },
    });
  } catch (error: any) {
    logger.error('Get invoice error:', error);

    res.status(404).json({
      success: false,
      message: error.message || 'Invoice not found',
    });
  }
}

/**
 * Get all invoices
 * GET /api/v1/invoices
 */
export async function getAll(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const filters = {
      status: req.query.status as string,
      customerId: req.query.customerId as string,
      search: req.query.search as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
    };

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

    const result = await getOrganizationInvoices(
      userWithOrg.organizationId,
      filters,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Get invoices error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get invoices',
    });
  }
}

/**
 * Update invoice
 * PUT /api/v1/invoices/:id
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

    const validatedData = updateInvoiceSchema.parse(req.body);

    const invoice = await updateInvoice(id, userWithOrg.organizationId, validatedData);

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: { invoice },
    });
  } catch (error: any) {
    logger.error('Update invoice error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update invoice',
    });
  }
}

/**
 * Delete invoice
 * DELETE /api/v1/invoices/:id
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

    const result = await deleteInvoice(id, userWithOrg.organizationId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Delete invoice error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete invoice',
    });
  }
}

/**
 * Submit invoice
 * POST /api/v1/invoices/:id/submit
 */
export async function submit(req: Request, res: Response) {
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

    const invoice = await submitInvoice(id, userWithOrg.organizationId);

    res.status(200).json({
      success: true,
      message: 'Invoice submitted successfully',
      data: { invoice },
    });
  } catch (error: any) {
    logger.error('Submit invoice error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit invoice',
    });
  }
}

/**
 * Get invoice statistics
 * GET /api/v1/invoices/stats
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

    const stats = await getInvoiceStats(userWithOrg.organizationId);

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error: any) {
    logger.error('Get invoice stats error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get invoice statistics',
    });
  }
}

