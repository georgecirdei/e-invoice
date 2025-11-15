import { Router } from 'express';
import {
  create,
  getById,
  getAll,
  update,
  remove,
  submit,
  getStats,
} from '../controllers/invoice.controller';
import {
  downloadPDF,
  downloadXML,
  getQRCode,
  emailInvoice,
} from '../controllers/document.controller';
import {
  recordInvoicePayment,
  getPayments,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/invoices/stats
 * @desc    Get invoice statistics
 * @access  Private
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/v1/invoices
 * @desc    Get all invoices for organization
 * @access  Private
 */
router.get('/', getAll);

/**
 * @route   POST /api/v1/invoices
 * @desc    Create a new invoice
 * @access  Private
 */
router.post('/', create);

/**
 * @route   GET /api/v1/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private
 */
router.get('/:id', getById);

/**
 * @route   PUT /api/v1/invoices/:id
 * @desc    Update invoice
 * @access  Private
 */
router.put('/:id', update);

/**
 * @route   DELETE /api/v1/invoices/:id
 * @desc    Delete invoice
 * @access  Private
 */
router.delete('/:id', remove);

/**
 * @route   POST /api/v1/invoices/:id/submit
 * @desc    Submit invoice for processing
 * @access  Private
 */
router.post('/:id/submit', submit);

/**
 * @route   GET /api/v1/invoices/:id/pdf
 * @desc    Download invoice as PDF
 * @access  Private
 */
router.get('/:id/pdf', downloadPDF);

/**
 * @route   GET /api/v1/invoices/:id/xml
 * @desc    Download invoice as XML
 * @access  Private
 */
router.get('/:id/xml', downloadXML);

/**
 * @route   GET /api/v1/invoices/:id/qrcode
 * @desc    Get invoice QR code
 * @access  Private
 */
router.get('/:id/qrcode', getQRCode);

/**
 * @route   POST /api/v1/invoices/:id/email
 * @desc    Email invoice to customer
 * @access  Private
 */
router.post('/:id/email', emailInvoice);

/**
 * @route   POST /api/v1/invoices/:id/payments
 * @desc    Record payment for invoice
 * @access  Private
 */
router.post('/:id/payments', recordInvoicePayment);

/**
 * @route   GET /api/v1/invoices/:id/payments
 * @desc    Get payments for invoice
 * @access  Private
 */
router.get('/:id/payments', getPayments);

export default router;

