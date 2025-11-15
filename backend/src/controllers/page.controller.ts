import { Request, Response } from 'express';
import {
  getAllPages,
  getPublishedPageBySlug,
  createPage,
  updatePage,
  deletePage,
  submitContactForm,
  getAllContactSubmissions,
  updateContactStatus,
} from '../services/page.service';
import logger from '../utils/logger';

/**
 * Get all pages (Super Admin)
 * GET /api/v1/pages
 */
export async function getPages(_req: Request, res: Response) {
  try {
    const pages = await getAllPages();

    res.status(200).json({
      success: true,
      data: { pages },
    });
  } catch (error: any) {
    logger.error('Get pages error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get pages',
    });
  }
}

/**
 * Get page by slug (Public)
 * GET /api/v1/pages/:slug
 */
export async function getPageBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const page = await getPublishedPageBySlug(slug);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { page },
    });
  } catch (error: any) {
    logger.error('Get page error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Failed to get page',
    });
  }
}

/**
 * Create page (Super Admin)
 * POST /api/v1/pages
 */
export async function createNewPage(req: Request, res: Response) {
  try {
    const page = await createPage(req.body);

    res.status(201).json({
      success: true,
      message: 'Page created successfully',
      data: { page },
    });
  } catch (error: any) {
    logger.error('Create page error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create page',
    });
  }
}

/**
 * Update page (Super Admin)
 * PUT /api/v1/pages/:id
 */
export async function updateExistingPage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const page = await updatePage(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Page updated successfully',
      data: { page },
    });
  } catch (error: any) {
    logger.error('Update page error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update page',
    });
  }
}

/**
 * Delete page (Super Admin)
 * DELETE /api/v1/pages/:id
 */
export async function deletExistingPage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await deletePage(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Delete page error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete page',
    });
  }
}

/**
 * Submit contact form (Public)
 * POST /api/v1/contact
 */
export async function submitContact(req: Request, res: Response) {
  try {
    const submission = await submitContactForm(req.body);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { submission },
    });
  } catch (error: any) {
    logger.error('Contact submission error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit form',
    });
  }
}

/**
 * Get contact submissions (Super Admin)
 * GET /api/v1/contact
 */
export async function getContactSubmissions(_req: Request, res: Response) {
  try {
    const submissions = await getAllContactSubmissions();

    res.status(200).json({
      success: true,
      data: { submissions },
    });
  } catch (error: any) {
    logger.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get submissions',
    });
  }
}

/**
 * Update contact status (Super Admin)
 * PATCH /api/v1/contact/:id
 */
export async function updateContactSubmissionStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const submission = await updateContactStatus(id, status);

    res.status(200).json({
      success: true,
      data: { submission },
    });
  } catch (error: any) {
    logger.error('Update contact status error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update status',
    });
  }
}

