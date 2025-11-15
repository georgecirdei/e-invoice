import nodemailer from 'nodemailer';
import logger from '../utils/logger';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send invoice email to customer
 */
export async function sendInvoiceEmail(
  customerEmail: string,
  customerName: string,
  invoiceNumber: string,
  totalAmount: number,
  currency: string,
  pdfBuffer: Buffer
) {
  try {
    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn('SMTP not configured, email not sent');
      throw new Error('Email service not configured. Please set SMTP credentials in .env file');
    }

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'E-Invoice'}" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Invoice ${invoiceNumber} from ${process.env.SMTP_FROM_NAME || 'Your Company'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .invoice-details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .total { font-size: 24px; font-weight: bold; color: #0ea5e9; margin: 15px 0; }
            .button { display: inline-block; padding: 12px 30px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice ${invoiceNumber}</h1>
            </div>
            <div class="content">
              <p>Dear ${customerName},</p>
              
              <p>Thank you for your business! Please find attached your invoice.</p>
              
              <div class="invoice-details">
                <h3>Invoice Summary</h3>
                <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                <p class="total">Total Amount: ${currency} ${totalAmount.toFixed(2)}</p>
              </div>
              
              <p>The invoice PDF is attached to this email. If you have any questions, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>Your Finance Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the E-Invoice system.</p>
              <p>© ${new Date().getFullYear()} E-Invoice. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Invoice email sent: ${invoiceNumber} to ${customerEmail}`);
    logger.debug(`Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      message: `Invoice sent to ${customerEmail}`,
    };
  } catch (error: any) {
    logger.error('Email sending error:', error);
    throw new Error(error.message || 'Failed to send email');
  }
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return false;
    }

    await transporter.verify();
    logger.info('Email service verified successfully');
    return true;
  } catch (error) {
    logger.error('Email verification error:', error);
    return false;
  }
}

