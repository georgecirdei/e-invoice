import prisma from '../config/database';
import logger from '../utils/logger';

interface CreateCustomerData {
  name: string;
  email: string;
  taxId?: string;
  registrationNumber?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
  organizationId: string;
}

interface UpdateCustomerData {
  name?: string;
  email?: string;
  taxId?: string;
  registrationNumber?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isActive?: boolean;
}

interface CustomerFilters {
  search?: string;
  isActive?: boolean;
  country?: string;
}

/**
 * Create a new customer
 */
export async function createCustomer(data: CreateCustomerData) {
  const { organizationId, ...customerData } = data;

  // Check if customer with this email exists in the organization
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      email: data.email,
      organizationId,
    },
  });

  if (existingCustomer) {
    throw new Error('Customer with this email already exists in your organization');
  }

  // Create customer
  const customer = await prisma.customer.create({
    data: {
      ...customerData,
      organizationId,
    },
  });

  logger.info(`Customer created: ${customer.name} in organization ${organizationId}`);

  return customer;
}

/**
 * Get customer by ID
 */
export async function getCustomerById(customerId: string, organizationId: string) {
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      organizationId,
    },
    include: {
      _count: {
        select: {
          invoices: true,
        },
      },
    },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  return customer;
}

/**
 * Get all customers for an organization
 */
export async function getOrganizationCustomers(
  organizationId: string,
  filters: CustomerFilters = {},
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    organizationId,
  };

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { taxId: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters.country) {
    where.country = filters.country;
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            invoices: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update customer
 */
export async function updateCustomer(
  customerId: string,
  organizationId: string,
  data: UpdateCustomerData
) {
  // Verify customer belongs to organization
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      organizationId,
    },
  });

  if (!existingCustomer) {
    throw new Error('Customer not found');
  }

  // If email is being changed, check it's unique in the organization
  if (data.email && data.email !== existingCustomer.email) {
    const emailExists = await prisma.customer.findFirst({
      where: {
        email: data.email,
        organizationId,
        NOT: {
          id: customerId,
        },
      },
    });

    if (emailExists) {
      throw new Error('Another customer with this email already exists');
    }
  }

  // Update customer
  const customer = await prisma.customer.update({
    where: { id: customerId },
    data,
    include: {
      _count: {
        select: {
          invoices: true,
        },
      },
    },
  });

  logger.info(`Customer updated: ${customerId} in organization ${organizationId}`);

  return customer;
}

/**
 * Delete customer
 */
export async function deleteCustomer(customerId: string, organizationId: string) {
  // Verify customer belongs to organization
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      organizationId,
    },
    include: {
      _count: {
        select: {
          invoices: true,
        },
      },
    },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  // Check if customer has invoices
  if (customer._count.invoices > 0) {
    throw new Error(
      `Cannot delete customer with ${customer._count.invoices} existing invoice(s). Please archive them first.`
    );
  }

  // Delete customer
  await prisma.customer.delete({
    where: { id: customerId },
  });

  logger.info(`Customer deleted: ${customerId} from organization ${organizationId}`);

  return { message: 'Customer deleted successfully' };
}

/**
 * Get customer statistics
 */
export async function getCustomerStats(organizationId: string) {
  const [total, active, inactive] = await Promise.all([
    prisma.customer.count({ where: { organizationId } }),
    prisma.customer.count({ where: { organizationId, isActive: true } }),
    prisma.customer.count({ where: { organizationId, isActive: false } }),
  ]);

  return {
    total,
    active,
    inactive,
  };
}

