import prisma from '../config/database';
import logger from '../utils/logger';
import {
  calculateLineItem,
  calculateInvoiceTotals,
  generateInvoiceNumber,
  getNextInvoiceSequence,
  validateInvoiceDates,
  toDecimal,
} from '../utils/invoice.utils';
import type { CreateInvoiceInput, UpdateInvoiceInput } from '../utils/invoice.validation';

/**
 * Create a new invoice
 */
export async function createInvoice(
  data: CreateInvoiceInput & { organizationId: string; createdById: string }
) {
  const { organizationId, createdById, lineItems, invoiceDate, dueDate, ...invoiceData } = data;

  // Validate dates
  validateInvoiceDates(new Date(invoiceDate), dueDate ? new Date(dueDate) : undefined);

  // Verify customer belongs to organization
  const customer = await prisma.customer.findFirst({
    where: {
      id: data.customerId,
      organizationId,
    },
  });

  if (!customer) {
    throw new Error('Customer not found or does not belong to your organization');
  }

  // Calculate invoice totals
  const totals = calculateInvoiceTotals(lineItems);

  // Generate invoice number
  const sequence = await getNextInvoiceSequence(organizationId);
  const invoiceNumber = generateInvoiceNumber(sequence);

  // Calculate line item totals
  const lineItemsWithTotals = lineItems.map((item) => {
    const calculated = calculateLineItem(item.quantity, item.unitPrice, item.taxRate);
    return {
      description: item.description,
      quantity: toDecimal(item.quantity),
      unitPrice: toDecimal(item.unitPrice),
      taxRate: toDecimal(item.taxRate),
      taxAmount: toDecimal(calculated.taxAmount),
      totalAmount: toDecimal(calculated.total),
    };
  });

  // Create invoice with line items
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      invoiceDate: new Date(invoiceDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      currency: invoiceData.currency || 'USD',
      subtotal: toDecimal(totals.subtotal),
      taxAmount: toDecimal(totals.taxAmount),
      totalAmount: toDecimal(totals.totalAmount),
      notes: invoiceData.notes || null,
      status: 'DRAFT',
      organizationId,
      customerId: customer.id,
      createdById,
      lineItems: {
        create: lineItemsWithTotals,
      },
    },
    include: {
      lineItems: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          taxId: true,
          country: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  logger.info(`Invoice created: ${invoiceNumber} for organization ${organizationId}`);

  return invoice;
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(invoiceId: string, organizationId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      organizationId,
    },
    include: {
      lineItems: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          taxId: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          country: true,
          postalCode: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  return invoice;
}

/**
 * Get all invoices for organization
 */
export async function getOrganizationInvoices(
  organizationId: string,
  filters: {
    status?: string;
    customerId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {},
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    organizationId,
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.customerId) {
    where.customerId = filters.customerId;
  }

  if (filters.search) {
    where.OR = [
      { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
      { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  if (filters.dateFrom || filters.dateTo) {
    where.invoiceDate = {};
    if (filters.dateFrom) {
      where.invoiceDate.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.invoiceDate.lte = new Date(filters.dateTo);
    }
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            lineItems: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    invoices,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update invoice
 */
export async function updateInvoice(
  invoiceId: string,
  organizationId: string,
  data: UpdateInvoiceInput
) {
  // Get existing invoice
  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      organizationId,
    },
  });

  if (!existingInvoice) {
    throw new Error('Invoice not found');
  }

  // Can only edit draft invoices
  if (existingInvoice.status !== 'DRAFT' && data.lineItems) {
    throw new Error('Cannot edit line items of submitted invoices');
  }

  // If customer is changing, verify they belong to organization
  if (data.customerId) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: data.customerId,
        organizationId,
      },
    });

    if (!customer) {
      throw new Error('Customer not found in your organization');
    }
  }

  // Validate dates if provided
  if (data.invoiceDate || data.dueDate) {
    validateInvoiceDates(
      data.invoiceDate ? new Date(data.invoiceDate) : existingInvoice.invoiceDate,
      data.dueDate ? new Date(data.dueDate) : existingInvoice.dueDate || undefined
    );
  }

  let updateData: any = {
    ...(data.customerId && { customerId: data.customerId }),
    ...(data.invoiceDate && { invoiceDate: new Date(data.invoiceDate) }),
    ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
    ...(data.currency && { currency: data.currency }),
    ...(data.notes !== undefined && { notes: data.notes }),
    ...(data.status && { status: data.status }),
  };

  // If line items are being updated, recalculate totals
  if (data.lineItems) {
    const totals = calculateInvoiceTotals(data.lineItems);

    updateData = {
      ...updateData,
      subtotal: toDecimal(totals.subtotal),
      taxAmount: toDecimal(totals.taxAmount),
      totalAmount: toDecimal(totals.totalAmount),
    };

    // Delete old line items and create new ones
    await prisma.invoiceLineItem.deleteMany({
      where: { invoiceId },
    });

    const lineItemsWithTotals = data.lineItems.map((item) => {
      const calculated = calculateLineItem(item.quantity, item.unitPrice, item.taxRate);
      return {
        description: item.description,
        quantity: toDecimal(item.quantity),
        unitPrice: toDecimal(item.unitPrice),
        taxRate: toDecimal(item.taxRate),
        taxAmount: toDecimal(calculated.taxAmount),
        totalAmount: toDecimal(calculated.total),
      };
    });

    updateData.lineItems = {
      create: lineItemsWithTotals,
    };
  }

  // Update invoice
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: updateData,
    include: {
      lineItems: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          taxId: true,
        },
      },
    },
  });

  logger.info(`Invoice updated: ${invoiceId}`);

  return invoice;
}

/**
 * Delete invoice
 */
export async function deleteInvoice(invoiceId: string, organizationId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      organizationId,
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Can only delete draft invoices
  if (invoice.status !== 'DRAFT') {
    throw new Error('Can only delete draft invoices');
  }

  await prisma.invoice.delete({
    where: { id: invoiceId },
  });

  logger.info(`Invoice deleted: ${invoiceId}`);

  return { message: 'Invoice deleted successfully' };
}

/**
 * Submit invoice for processing
 * Note: This marks invoice as submitted in our system
 * Use /compliance/submit/:id to submit to government
 */
export async function submitInvoice(invoiceId: string, organizationId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      organizationId,
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (invoice.status !== 'DRAFT' && invoice.status !== 'PENDING_APPROVAL') {
    throw new Error('Invoice has already been submitted');
  }

  // Update status to submitted
  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
    include: {
      lineItems: true,
      customer: true,
    },
  });

  logger.info(`Invoice submitted: ${invoice.invoiceNumber}`);

  return updatedInvoice;
}

/**
 * Get invoice statistics
 */
export async function getInvoiceStats(organizationId: string) {
  const [total, draft, submitted, validated, rejected] = await Promise.all([
    prisma.invoice.count({ where: { organizationId } }),
    prisma.invoice.count({ where: { organizationId, status: 'DRAFT' } }),
    prisma.invoice.count({ where: { organizationId, status: 'SUBMITTED' } }),
    prisma.invoice.count({ where: { organizationId, status: 'VALIDATED' } }),
    prisma.invoice.count({ where: { organizationId, status: 'REJECTED' } }),
  ]);

  const totalAmount = await prisma.invoice.aggregate({
    where: { organizationId, status: { in: ['SUBMITTED', 'VALIDATED'] } },
    _sum: {
      totalAmount: true,
    },
  });

  return {
    total,
    draft,
    submitted,
    validated,
    rejected,
    totalAmount: Number(totalAmount._sum.totalAmount || 0),
  };
}

