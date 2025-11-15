import PDFDocument from 'pdfkit';
import prisma from '../config/database';
import { generateQRCodeBuffer } from './qrcode.service';
import logger from '../utils/logger';

/**
 * Generate PDF invoice
 */
export async function generateInvoicePDF(invoiceId: string): Promise<Buffer> {
  try {
    // Get invoice with all details
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        lineItems: {
          orderBy: { createdAt: 'asc' },
        },
        customer: true,
        organization: true,
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Generate QR code
    const qrCodeBuffer = await generateQRCodeBuffer(invoice.id, invoice.invoiceNumber);

    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Collect PDF data in buffer
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);
    });

    // Build PDF content
    buildInvoicePDF(doc, invoice, qrCodeBuffer);

    // Finalize PDF
    doc.end();

    const pdfBuffer = await pdfPromise;

    logger.info(`PDF generated for invoice: ${invoice.invoiceNumber}`);

    return pdfBuffer;
  } catch (error) {
    logger.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
}

/**
 * Build PDF invoice content
 */
function buildInvoicePDF(doc: typeof PDFDocument.prototype, invoice: any, qrCodeBuffer: Buffer) {
  const primaryColor = '#0ea5e9'; // Primary blue
  const textColor = '#1f2937'; // Gray 900

  // Header
  doc.fontSize(28)
     .fillColor(primaryColor)
     .text('INVOICE', 50, 50, { align: 'left' });

  // Organization Info (top right)
  doc.fontSize(10)
     .fillColor(textColor)
     .text(invoice.organization.name, 350, 50, { align: 'right' })
     .text(invoice.organization.email, { align: 'right' })
     .text(`Tax ID: ${invoice.organization.taxId}`, { align: 'right' });

  if (invoice.organization.phone) {
    doc.text(invoice.organization.phone, { align: 'right' });
  }

  // Invoice Details Box
  doc.fontSize(12)
     .fillColor(textColor)
     .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 120)
     .fontSize(10)
     .text(`Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 50, 140);

  if (invoice.dueDate) {
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 155);
  }

  doc.text(`Status: ${invoice.status}`, 50, invoice.dueDate ? 170 : 155);

  // Bill To Section
  doc.fontSize(12)
     .fillColor(primaryColor)
     .text('BILL TO:', 50, 210);

  doc.fontSize(11)
     .fillColor(textColor)
     .font('Helvetica-Bold')
     .text(invoice.customer.name, 50, 230)
     .font('Helvetica')
     .fontSize(10)
     .text(invoice.customer.email, 50, 245);

  if (invoice.customer.taxId) {
    doc.text(`Tax ID: ${invoice.customer.taxId}`, 50, 260);
  }

  let yPos = invoice.customer.taxId ? 275 : 260;

  if (invoice.customer.address) {
    doc.text(invoice.customer.address, 50, yPos);
    yPos += 15;
  }

  if (invoice.customer.city || invoice.customer.state) {
    const cityState = [invoice.customer.city, invoice.customer.state]
      .filter(Boolean)
      .join(', ');
    doc.text(`${cityState} ${invoice.customer.postalCode || ''}`, 50, yPos);
    yPos += 15;
  }

  doc.text(invoice.customer.country, 50, yPos);

  // Line Items Table
  const tableTop = yPos + 40;
  
  // Table Header
  doc.fontSize(10)
     .fillColor('#ffffff')
     .rect(50, tableTop, 495, 25)
     .fill(primaryColor);

  doc.fillColor('#ffffff')
     .text('Description', 60, tableTop + 8)
     .text('Qty', 320, tableTop + 8, { width: 40, align: 'right' })
     .text('Price', 370, tableTop + 8, { width: 60, align: 'right' })
     .text('Tax %', 440, tableTop + 8, { width: 40, align: 'right' })
     .text('Total', 490, tableTop + 8, { width: 55, align: 'right' });

  // Line Items
  let itemY = tableTop + 35;
  doc.fillColor(textColor);

  invoice.lineItems.forEach((item: any, index: number) => {
    // Alternate row colors
    if (index % 2 === 0) {
      doc.rect(50, itemY - 5, 495, 25).fill('#f9fafb');
      doc.fillColor(textColor);
    }

    doc.fontSize(9)
       .text(item.description, 60, itemY, { width: 250 })
       .text(Number(item.quantity).toString(), 320, itemY, { width: 40, align: 'right' })
       .text(`${invoice.currency} ${Number(item.unitPrice).toFixed(2)}`, 370, itemY, { width: 60, align: 'right' })
       .text(`${Number(item.taxRate).toFixed(1)}%`, 440, itemY, { width: 40, align: 'right' })
       .text(`${invoice.currency} ${Number(item.totalAmount).toFixed(2)}`, 490, itemY, { width: 55, align: 'right' });

    itemY += 25;
  });

  // Totals Section
  const totalsY = itemY + 20;
  
  doc.fontSize(10)
     .text('Subtotal:', 380, totalsY, { width: 100, align: 'right' })
     .text(`${invoice.currency} ${Number(invoice.subtotal).toFixed(2)}`, 490, totalsY, { width: 55, align: 'right' });

  doc.text('Tax:', 380, totalsY + 20, { width: 100, align: 'right' })
     .text(`${invoice.currency} ${Number(invoice.taxAmount).toFixed(2)}`, 490, totalsY + 20, { width: 55, align: 'right' });

  // Grand Total
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor(primaryColor)
     .text('TOTAL:', 380, totalsY + 45, { width: 100, align: 'right' })
     .text(`${invoice.currency} ${Number(invoice.totalAmount).toFixed(2)}`, 490, totalsY + 45, { width: 55, align: 'right' });

  // Notes Section
  if (invoice.notes) {
    const notesY = totalsY + 80;
    doc.fontSize(10)
       .fillColor(textColor)
       .font('Helvetica-Bold')
       .text('Notes:', 50, notesY)
       .font('Helvetica')
       .text(invoice.notes, 50, notesY + 15, { width: 495 });
  }

  // QR Code (bottom right)
  doc.image(qrCodeBuffer, 450, 700, { width: 80, height: 80 });

  // Footer
  doc.fontSize(8)
     .fillColor('#9ca3af')
     .text(
       `Generated on ${new Date().toLocaleString()} | Invoice ID: ${invoice.id}`,
       50,
       750,
       { align: 'center', width: 495 }
     );

  doc.text(
    'This is an electronically generated invoice.',
    50,
    765,
    { align: 'center', width: 495 }
  );
}

