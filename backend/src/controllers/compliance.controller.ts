import { Request, Response } from 'express';
import {
  submitToGovernment,
  checkGovernmentStatus,
  retrySubmission,
  getSubmissionHistory,
  getComplianceStats,
} from '../services/submission.service';
import logger from '../utils/logger';

/**
 * Submit invoice to government
 * POST /api/v1/compliance/submit/:id
 */
export async function submitInvoice(req: Request, res: Response) {
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

    const result = await submitToGovernment(id, userWithOrg.organizationId);

    res.status(200).json({
      success: result.submission.success,
      message: result.submission.success
        ? 'Invoice submitted to government successfully'
        : 'Invoice submission failed',
      data: result,
    });
  } catch (error: any) {
    logger.error('Government submission error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit invoice to government',
    });
  }
}

/**
 * Check invoice status with government
 * GET /api/v1/compliance/status/:id
 */
export async function checkStatus(req: Request, res: Response) {
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

    const status = await checkGovernmentStatus(id, userWithOrg.organizationId);

    res.status(200).json({
      success: true,
      data: { status },
    });
  } catch (error: any) {
    logger.error('Government status check error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to check invoice status',
    });
  }
}

/**
 * Retry failed submission
 * POST /api/v1/compliance/retry/:id
 */
export async function retry(req: Request, res: Response) {
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

    const result = await retrySubmission(id, userWithOrg.organizationId);

    res.status(200).json({
      success: result.submission.success,
      message: result.submission.success
        ? 'Invoice resubmitted successfully'
        : 'Invoice resubmission failed',
      data: result,
    });
  } catch (error: any) {
    logger.error('Retry submission error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to retry submission',
    });
  }
}

/**
 * Get submission history for invoice
 * GET /api/v1/compliance/history/:id
 */
export async function getHistory(req: Request, res: Response) {
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

    const history = await getSubmissionHistory(id, userWithOrg.organizationId);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    logger.error('Get submission history error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get submission history',
    });
  }
}

/**
 * Get compliance statistics
 * GET /api/v1/compliance/stats
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

    const stats = await getComplianceStats(userWithOrg.organizationId);

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error: any) {
    logger.error('Get compliance stats error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get compliance statistics',
    });
  }
}

