import prisma from '../config/database';
import { governmentAPI } from './government-api.service';
import { generateInvoiceXML } from './xml.service';
import logger from '../utils/logger';

/**
 * Submit invoice to government e-invoice system
 */
export async function submitToGovernment(invoiceId: string, organizationId: string) {
  try {
    // Get invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Check if already submitted
    if (invoice.governmentId) {
      throw new Error('Invoice has already been submitted to government');
    }

    // Generate XML
    const xmlData = await generateInvoiceXML(invoiceId);

    // Validate before submission
    const validation = await governmentAPI.validateInvoice(xmlData);
    
    if (!validation.isValid) {
      throw new Error(
        `Invoice validation failed: ${validation.errors.map((e) => e.message).join(', ')}`
      );
    }

    // Submit to government
    const submissionResponse = await governmentAPI.submitInvoice(
      invoice.invoiceNumber,
      xmlData,
      invoice.invoiceDate,
      Number(invoice.totalAmount),
      invoice.currency
    );

    // Update invoice with government response
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: submissionResponse.status,
        governmentId: submissionResponse.governmentId || null,
        governmentStatus: submissionResponse.status,
        submittedAt: new Date(submissionResponse.submittedAt),
        validatedAt: submissionResponse.status === 'VALIDATED' ? new Date() : null,
        xmlData,
      },
    });

    // Create submission history record
    await createSubmissionHistory({
      invoiceId,
      submissionId: submissionResponse.submissionId,
      governmentId: submissionResponse.governmentId || null,
      status: submissionResponse.status,
      request: { invoiceNumber: invoice.invoiceNumber, xmlData },
      response: submissionResponse,
      errors: submissionResponse.validationErrors || null,
    });

    logger.info(
      `Invoice ${invoice.invoiceNumber} submitted to government: ${submissionResponse.status}`
    );

    return {
      invoice: updatedInvoice,
      submission: submissionResponse,
    };
  } catch (error: any) {
    logger.error('Government submission error:', error);
    throw error;
  }
}

/**
 * Check invoice status with government
 */
export async function checkGovernmentStatus(invoiceId: string, organizationId: string) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (!invoice.governmentId) {
      throw new Error('Invoice has not been submitted to government yet');
    }

    // Check status with government
    const statusResponse = await governmentAPI.checkInvoiceStatus(invoice.governmentId);

    // Update invoice status if changed
    if (statusResponse.status !== invoice.governmentStatus) {
      const newStatus = statusResponse.status === 'PENDING' ? 'SUBMITTED' : statusResponse.status;
      
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          governmentStatus: statusResponse.status,
          validatedAt: statusResponse.validatedAt ? new Date(statusResponse.validatedAt) : null,
          status: newStatus as any,
        },
      });
    }

    return statusResponse;
  } catch (error: any) {
    logger.error('Government status check error:', error);
    throw error;
  }
}

/**
 * Retry failed submission
 */
export async function retrySubmission(invoiceId: string, organizationId: string) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Reset government fields
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        governmentId: null,
        governmentStatus: null,
        submittedAt: null,
        validatedAt: null,
        status: 'DRAFT',
      },
    });

    // Retry submission
    return await submitToGovernment(invoiceId, organizationId);
  } catch (error: any) {
    logger.error('Retry submission error:', error);
    throw error;
  }
}

/**
 * Create submission history record
 */
async function createSubmissionHistory(data: {
  invoiceId: string;
  submissionId: string;
  governmentId: string | null;
  status: string;
  request: any;
  response: any;
  errors: string[] | null;
}) {
  // Note: This would require a SubmissionHistory table in the database
  // For now, we'll log it
  logger.info('Submission history:', data);
  
  // TODO: When SubmissionHistory table is added to Prisma schema:
  // return await prisma.submissionHistory.create({ data });
  
  return data;
}

/**
 * Get submission history for invoice
 */
export async function getSubmissionHistory(invoiceId: string, organizationId: string) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
      select: {
        id: true,
        invoiceNumber: true,
        governmentId: true,
        governmentStatus: true,
        submittedAt: true,
        validatedAt: true,
        status: true,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Return basic submission info from invoice
    // TODO: Query SubmissionHistory table when implemented
    return {
      invoice,
      submissions: invoice.governmentId
        ? [
            {
              submissionId: invoice.governmentId,
              governmentId: invoice.governmentId,
              status: invoice.governmentStatus,
              submittedAt: invoice.submittedAt,
              validatedAt: invoice.validatedAt,
            },
          ]
        : [],
    };
  } catch (error: any) {
    logger.error('Get submission history error:', error);
    throw error;
  }
}

/**
 * Get compliance statistics
 */
export async function getComplianceStats(organizationId: string) {
  const [submitted, validated, rejected, pending] = await Promise.all([
    prisma.invoice.count({
      where: {
        organizationId,
        governmentId: { not: null },
      },
    }),
    prisma.invoice.count({
      where: {
        organizationId,
        governmentStatus: 'VALIDATED',
      },
    }),
    prisma.invoice.count({
      where: {
        organizationId,
        governmentStatus: 'REJECTED',
      },
    }),
    prisma.invoice.count({
      where: {
        organizationId,
        status: 'SUBMITTED',
        governmentStatus: null,
      },
    }),
  ]);

  const complianceRate =
    submitted > 0 ? Math.round((validated / submitted) * 100) : 0;

  return {
    submitted,
    validated,
    rejected,
    pending,
    complianceRate,
  };
}

