import { Request, Response } from 'express';
import {
  recordPayment,
  getInvoicePayments,
  deletePayment,
  getPaymentStats,
  getOverdueInvoices,
} from '../services/payment.service';
import { z } from 'zod';
import logger from '../utils/logger';

const recordPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentDate: z.string().or(z.date()),
  paymentMethod: z.enum([
    'BANK_TRANSFER',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'CASH',
    'CHECK',
    'PAYPAL',
    'STRIPE',
    'OTHER',
  ]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Record payment for invoice
 * POST /api/v1/invoices/:id/payments
 */
export async function recordInvoicePayment(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id: invoiceId } = req.params;

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

    const validatedData = recordPaymentSchema.parse(req.body);

    const payment = await recordPayment({
      ...validatedData,
      paymentDate: new Date(validatedData.paymentDate),
      invoiceId,
      organizationId: userWithOrg.organizationId,
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: { payment },
    });
  } catch (error: any) {
    logger.error('Record payment error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to record payment',
    });
  }
}

/**
 * Get payments for invoice
 * GET /api/v1/invoices/:id/payments
 */
export async function getPayments(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id: invoiceId } = req.params;

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

    const payments = await getInvoicePayments(invoiceId, userWithOrg.organizationId);

    res.status(200).json({
      success: true,
      data: { payments },
    });
  } catch (error: any) {
    logger.error('Get payments error:', error);

    res.status(404).json({
      success: false,
      message: error.message || 'Failed to get payments',
    });
  }
}

/**
 * Delete payment
 * DELETE /api/v1/payments/:id
 */
export async function removePayment(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id: paymentId } = req.params;

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

    const result = await deletePayment(paymentId, userWithOrg.organizationId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Delete payment error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete payment',
    });
  }
}

/**
 * Get payment statistics
 * GET /api/v1/payments/stats
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

    const stats = await getPaymentStats(userWithOrg.organizationId);

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error: any) {
    logger.error('Get payment stats error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment statistics',
    });
  }
}

/**
 * Get overdue invoices
 * GET /api/v1/payments/overdue
 */
export async function getOverdue(req: Request, res: Response) {
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

    const overdueInvoices = await getOverdueInvoices(userWithOrg.organizationId);

    res.status(200).json({
      success: true,
      data: { invoices: overdueInvoices },
    });
  } catch (error: any) {
    logger.error('Get overdue invoices error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get overdue invoices',
    });
  }
}

