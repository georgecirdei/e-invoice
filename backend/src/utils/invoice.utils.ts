/**
 * Calculate line item totals
 */
export function calculateLineItem(
  quantity: number,
  unitPrice: number,
  taxRate: number
): {
  subtotal: number;
  taxAmount: number;
  total: number;
} {
  const subtotal = quantity * unitPrice;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  return {
    subtotal: roundToTwo(subtotal),
    taxAmount: roundToTwo(taxAmount),
    total: roundToTwo(total),
  };
}

/**
 * Calculate invoice totals from line items
 */
export function calculateInvoiceTotals(
  lineItems: Array<{
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }>
): {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
} {
  let subtotal = 0;
  let taxAmount = 0;

  lineItems.forEach((item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemTax = (itemSubtotal * item.taxRate) / 100;

    subtotal += itemSubtotal;
    taxAmount += itemTax;
  });

  const totalAmount = subtotal + taxAmount;

  return {
    subtotal: roundToTwo(subtotal),
    taxAmount: roundToTwo(taxAmount),
    totalAmount: roundToTwo(totalAmount),
  };
}

/**
 * Round to 2 decimal places
 */
export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Generate invoice number
 * Format: INV-YYYYMMDD-XXXX (e.g., INV-20251112-0001)
 */
export function generateInvoiceNumber(sequenceNumber: number): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const sequence = String(sequenceNumber).padStart(4, '0');

  return `INV-${year}${month}${day}-${sequence}`;
}

/**
 * Get next invoice sequence number for organization
 */
export async function getNextInvoiceSequence(organizationId: string): Promise<number> {
  const prisma = (await import('../config/database')).default;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Count invoices created today for this organization
  const count = await prisma.invoice.count({
    where: {
      organizationId,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  return count + 1;
}

/**
 * Validate invoice dates
 */
export function validateInvoiceDates(invoiceDate: Date, dueDate?: Date): void {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Invoice date should not be in the future
  const invDate = new Date(invoiceDate);
  invDate.setHours(0, 0, 0, 0);

  if (invDate > now) {
    throw new Error('Invoice date cannot be in the future');
  }

  // Due date should be after invoice date
  if (dueDate) {
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (due < invDate) {
      throw new Error('Due date must be after invoice date');
    }
  }
}

/**
 * Convert to Decimal for Prisma
 */
export function toDecimal(value: number): any {
  return value;
}

