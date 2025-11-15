import { Request, Response } from 'express';
import {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
  getAllUsers,
  getAllOrganizationsAdmin,
  getSystemStats,
  createComplianceRule,
  getCountryComplianceRules,
} from '../services/admin.service';
import logger from '../utils/logger';

/**
 * Get system statistics
 * GET /api/v1/admin/stats
 */
export async function getStats(_req: Request, res: Response) {
  try {
    const stats = await getSystemStats();

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error: any) {
    logger.error('Get system stats error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get system statistics',
    });
  }
}

/**
 * Get all countries
 * GET /api/v1/admin/countries
 */
export async function getCountries(_req: Request, res: Response) {
  try {
    const countries = await getAllCountries();

    res.status(200).json({
      success: true,
      data: { countries },
    });
  } catch (error: any) {
    logger.error('Get countries error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get countries',
    });
  }
}

/**
 * Get country by ID
 * GET /api/v1/admin/countries/:id
 */
export async function getCountry(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const country = await getCountryById(id);

    res.status(200).json({
      success: true,
      data: { country },
    });
  } catch (error: any) {
    logger.error('Get country error:', error);

    res.status(404).json({
      success: false,
      message: error.message || 'Country not found',
    });
  }
}

/**
 * Create country
 * POST /api/v1/admin/countries
 */
export async function createCountryConfig(req: Request, res: Response) {
  try {
    const country = await createCountry(req.body);

    res.status(201).json({
      success: true,
      message: 'Country configuration created successfully',
      data: { country },
    });
  } catch (error: any) {
    logger.error('Create country error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create country configuration',
    });
  }
}

/**
 * Update country
 * PUT /api/v1/admin/countries/:id
 */
export async function updateCountryConfig(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const country = await updateCountry(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Country configuration updated successfully',
      data: { country },
    });
  } catch (error: any) {
    logger.error('Update country error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update country configuration',
    });
  }
}

/**
 * Delete country
 * DELETE /api/v1/admin/countries/:id
 */
export async function deleteCountryConfig(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await deleteCountry(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Delete country error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete country configuration',
    });
  }
}

/**
 * Get all users
 * GET /api/v1/admin/users
 */
export async function getUsers(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getAllUsers(page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Get users error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get users',
    });
  }
}

/**
 * Get all organizations
 * GET /api/v1/admin/organizations
 */
export async function getOrganizations(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getAllOrganizationsAdmin(page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Get organizations error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get organizations',
    });
  }
}

/**
 * Create compliance rule
 * POST /api/v1/admin/countries/:id/rules
 */
export async function createRule(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const rule = await createComplianceRule({
      countryId: id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      message: 'Compliance rule created successfully',
      data: { rule },
    });
  } catch (error: any) {
    logger.error('Create compliance rule error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create compliance rule',
    });
  }
}

/**
 * Get compliance rules for country
 * GET /api/v1/admin/countries/:id/rules
 */
export async function getRules(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const rules = await getCountryComplianceRules(id);

    res.status(200).json({
      success: true,
      data: { rules },
    });
  } catch (error: any) {
    logger.error('Get compliance rules error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get compliance rules',
    });
  }
}

