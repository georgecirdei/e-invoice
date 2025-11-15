import { Router } from 'express';
import {
  getPages,
  getPageBySlug,
  createNewPage,
  updateExistingPage,
  deletExistingPage,
  submitContact,
  getContactSubmissions,
  updateContactSubmissionStatus,
} from '../controllers/page.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireSuperAdmin } from '../middleware/admin.middleware';

const router = Router();

/**
 * Public routes
 */
router.get('/pages/:slug', getPageBySlug);
router.post('/contact', submitContact);

/**
 * Super Admin routes
 */
router.get('/pages', authenticate, requireSuperAdmin, getPages);
router.post('/pages', authenticate, requireSuperAdmin, createNewPage);
router.put('/pages/:id', authenticate, requireSuperAdmin, updateExistingPage);
router.delete('/pages/:id', authenticate, requireSuperAdmin, deletExistingPage);
router.get('/contact', authenticate, requireSuperAdmin, getContactSubmissions);
router.patch('/contact/:id', authenticate, requireSuperAdmin, updateContactSubmissionStatus);

export default router;

