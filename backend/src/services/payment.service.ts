import prisma from '../config/database';
import logger from '../utils/logger';

interface RecordPaymentData {
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  organizationId: string;
}

/**
 * Record a payment for an invoice
 */
export async function recordPayment(data: RecordPaymentData) {
  const { organizationId, invoiceId, ...paymentData } = data;

  // Verify invoice belongs to organization
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      organizationId,
    },
    include: {
      payments: true,
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Calculate total paid including this payment
  const previouslyPaid = invoice.payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );
  const totalPaid = previouslyPaid + data.amount;
  const totalAmount = Number(invoice.totalAmount);

  // Validate payment amount
  if (totalPaid > totalAmount) {
    throw new Error(
      `Payment amount exceeds invoice total. Remaining: ${(totalAmount - previouslyPaid).toFixed(2)}`
    );
  }

  // Determine payment status
  let paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' = 'UNPAID';
  if (totalPaid >= totalAmount) {
    paymentStatus = 'PAID';
  } else if (totalPaid > 0) {
    paymentStatus = 'PARTIALLY_PAID';
  }

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      amount: paymentData.amount,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod as any,
      reference: paymentData.reference,
      notes: paymentData.notes,
      invoiceId,
    },
  });

  // Update invoice payment status
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paymentStatus,
      paidAmount: totalPaid,
      paymentDate: paymentStatus === 'PAID' ? data.paymentDate : invoice.paymentDate,
    },
  });

  logger.info(
    `Payment recorded: ${data.amount} for invoice ${invoice.invoiceNumber}. Status: ${paymentStatus}`
  );

  return payment;
}

/**
 * Get payment history for invoice
 */
export async function getInvoicePayments(invoiceId: string, organizationId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      organizationId,
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const payments = await prisma.payment.findMany({
    where: { invoiceId },
    orderBy: { paymentDate: 'desc' },
  });

  return payments;
}

/**
 * Delete payment
 */
export async function deletePayment(paymentId: string, organizationId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      invoice: true,
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.invoice.organizationId !== organizationId) {
    throw new Error('You do not have access to this payment');
  }

  // Delete payment
  await prisma.payment.delete({
    where: { id: paymentId },
  });

  // Recalculate invoice payment status
  const remainingPayments = await prisma.payment.findMany({
    where: { invoiceId: payment.invoiceId },
  });

  const totalPaid = remainingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalAmount = Number(payment.invoice.totalAmount);

  let paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' = 'UNPAID';
  if (totalPaid >= totalAmount) {
    paymentStatus = 'PAID';
  } else if (totalPaid > 0) {
    paymentStatus = 'PARTIALLY_PAID';
  }

  await prisma.invoice.update({
    where: { id: payment.invoiceId },
    data: {
      paymentStatus,
      paidAmount: totalPaid,
      paymentDate: paymentStatus === 'PAID' ? remainingPayments[0]?.paymentDate : null,
    },
  });

  logger.info(`Payment deleted: ${paymentId}`);

  return { message: 'Payment deleted successfully' };
}

/**
 * Get payment statistics for organization
 * Only counts VALIDATED (government approved) invoices
 */
export async function getPaymentStats(organizationId: string) {
  const validatedFilter = {
    organizationId,
    governmentStatus: 'VALIDATED', // Only count validated invoices
  };

  const [totalInvoices, paidInvoices, partiallyPaid, unpaidInvoices, overdueInvoices] =
    await Promise.all([
      prisma.invoice.count({ where: validatedFilter }),
      prisma.invoice.count({ where: { ...validatedFilter, paymentStatus: 'PAID' } }),
      prisma.invoice.count({ where: { ...validatedFilter, paymentStatus: 'PARTIALLY_PAID' } }),
      prisma.invoice.count({ where: { ...validatedFilter, paymentStatus: 'UNPAID' } }),
      prisma.invoice.count({
        where: {
          ...validatedFilter,
          paymentStatus: { in: ['UNPAID', 'PARTIALLY_PAID'] },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

  const totalRevenue = await prisma.invoice.aggregate({
    where: {
      ...validatedFilter,
      paymentStatus: 'PAID',
    },
    _sum: {
      totalAmount: true,
    },
  });

  const outstandingAmount = await prisma.invoice.aggregate({
    where: {
      ...validatedFilter,
      paymentStatus: { in: ['UNPAID', 'PARTIALLY_PAID'] },
    },
    _sum: {
      totalAmount: true,
      paidAmount: true,
    },
  });

  const outstanding =
    Number(outstandingAmount._sum.totalAmount || 0) -
    Number(outstandingAmount._sum.paidAmount || 0);

  return {
    totalInvoices,
    paidInvoices,
    partiallyPaid,
    unpaidInvoices,
    overdueInvoices,
    totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
    outstandingAmount: outstanding,
  };
}

/**
 * Get overdue invoices
 * Only includes VALIDATED (government approved) invoices
 */
export async function getOverdueInvoices(organizationId: string) {
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      organizationId,
      governmentStatus: 'VALIDATED', // Only validated invoices
      paymentStatus: { in: ['UNPAID', 'PARTIALLY_PAID'] },
      dueDate: { lt: new Date() },
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      dueDate: 'asc',
    },
  });

  return overdueInvoices;
}

