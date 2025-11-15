import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import organizationRoutes from './organization.routes';
import customerRoutes from './customer.routes';
import invoiceRoutes from './invoice.routes';
import complianceRoutes from './compliance.routes';
import adminRoutes from './admin.routes';
import paymentRoutes from './payment.routes';
import pageRoutes from './page.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Organization routes
router.use('/organizations', organizationRoutes);

// Customer routes
router.use('/customers', customerRoutes);

// Invoice routes
router.use('/invoices', invoiceRoutes);

// Payment routes
router.use('/payments', paymentRoutes);

// Compliance routes
router.use('/compliance', complianceRoutes);

// Notification routes
router.use('/notifications', notificationRoutes);

// Admin routes (Super Admin only)
router.use('/admin', adminRoutes);

// Page/CMS routes (Public + Super Admin)
router.use('/', pageRoutes);

// Health check (for convenience)
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

