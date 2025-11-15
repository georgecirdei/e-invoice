import { Request, Response } from 'express';
import { generateInvoicePDF } from '../services/pdf.service';
import { generateInvoiceXML } from '../services/xml.service';
import { sendInvoiceEmail } from '../services/email.service';
import { generateInvoiceQRCode } from '../services/qrcode.service';
import logger from '../utils/logger';
import prisma from '../config/database';

/**
 * Download invoice PDF
 * GET /api/v1/invoices/:id/pdf
 */
export async function downloadPDF(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    // Verify user has access to this invoice
    const userWithOrg = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { organizationId: true },
    });

    if (!userWithOrg?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'You must belong to an organization',
      });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        organizationId: userWithOrg.organizationId,
      },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(id);

    // Save PDF URL to database
    const pdfUrl = `/api/v1/invoices/${id}/pdf`;
    await prisma.invoice.update({
      where: { id },
      data: { pdfUrl },
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

    logger.info(`PDF downloaded for invoice: ${invoice.invoiceNumber}`);
  } catch (error: any) {
    logger.error('PDF download error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate PDF',
    });
  }
}

/**
 * Download invoice XML
 * GET /api/v1/invoices/:id/xml
 */
export async function downloadXML(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const userWithOrg = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { organizationId: true },
    });

    if (!userWithOrg?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'You must belong to an organization',
      });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        organizationId: userWithOrg.organizationId,
      },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Generate XML
    const xml = await generateInvoiceXML(id);

    // Save XML to database
    await prisma.invoice.update({
      where: { id },
      data: { xmlData: xml },
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.xml"`);

    // Send XML
    res.send(xml);

    logger.info(`XML downloaded for invoice: ${invoice.invoiceNumber}`);
  } catch (error: any) {
    logger.error('XML download error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate XML',
    });
  }
}

/**
 * Get invoice QR code
 * GET /api/v1/invoices/:id/qrcode
 */
export async function getQRCode(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const userWithOrg = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { organizationId: true },
    });

    if (!userWithOrg?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'You must belong to an organization',
      });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        organizationId: userWithOrg.organizationId,
      },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Generate QR code
    const qrCode = await generateInvoiceQRCode(id, invoice.invoiceNumber);

    // Save QR code to database
    await prisma.invoice.update({
      where: { id },
      data: { qrCode },
    });

    res.status(200).json({
      success: true,
      data: { qrCode },
    });

    logger.info(`QR code generated for invoice: ${invoice.invoiceNumber}`);
  } catch (error: any) {
    logger.error('QR code generation error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate QR code',
    });
  }
}

/**
 * Email invoice to customer
 * POST /api/v1/invoices/:id/email
 */
export async function emailInvoice(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const userWithOrg = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { organizationId: true },
    });

    if (!userWithOrg?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'You must belong to an organization',
      });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        organizationId: userWithOrg.organizationId,
      },
      include: {
        customer: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(id);

    // Send email
    const result = await sendInvoiceEmail(
      invoice.customer.email,
      invoice.customer.name,
      invoice.invoiceNumber,
      Number(invoice.totalAmount),
      invoice.currency,
      pdfBuffer
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });

    logger.info(`Invoice emailed: ${invoice.invoiceNumber} to ${invoice.customer.email}`);
  } catch (error: any) {
    logger.error('Email invoice error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to email invoice',
    });
  }
}

