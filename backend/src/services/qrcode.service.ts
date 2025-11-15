import QRCode from 'qrcode';
import logger from '../utils/logger';

/**
 * Generate QR code for invoice
 * Contains invoice verification URL
 */
export async function generateInvoiceQRCode(invoiceId: string, invoiceNumber: string): Promise<string> {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invoices/${invoiceId}`;
    
    const qrCodeData = JSON.stringify({
      invoiceNumber,
      invoiceId,
      verificationUrl,
      timestamp: new Date().toISOString(),
    });

    // Generate QR code as base64 data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrCodeData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 200,
      margin: 1,
    });

    logger.info(`QR code generated for invoice: ${invoiceNumber}`);

    return qrCodeDataURL;
  } catch (error) {
    logger.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as buffer (for PDF embedding)
 */
export async function generateQRCodeBuffer(invoiceId: string, invoiceNumber: string): Promise<Buffer> {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invoices/${invoiceId}`;
    
    const qrCodeData = JSON.stringify({
      invoiceNumber,
      invoiceId,
      verificationUrl,
      timestamp: new Date().toISOString(),
    });

    const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 200,
      margin: 1,
    });

    return qrCodeBuffer;
  } catch (error) {
    logger.error('QR code buffer generation error:', error);
    throw new Error('Failed to generate QR code buffer');
  }
}

