import prisma from '../config/database';
import logger from '../utils/logger';

/**
 * Get all country configurations
 */
export async function getAllCountries() {
  const countries = await prisma.countryConfig.findMany({
    include: {
      _count: {
        select: {
          complianceRules: true,
          xmlTemplates: true,
        },
      },
    },
    orderBy: {
      countryName: 'asc',
    },
  });

  return countries;
}

/**
 * Get country by ID
 */
export async function getCountryById(id: string) {
  const country = await prisma.countryConfig.findUnique({
    where: { id },
    include: {
      complianceRules: true,
      xmlTemplates: true,
    },
  });

  if (!country) {
    throw new Error('Country configuration not found');
  }

  return country;
}

/**
 * Create country configuration
 */
export async function createCountry(data: {
  countryCode: string;
  countryName: string;
  apiProvider: string;
  apiBaseUrl?: string;
  apiClientId?: string;
  apiClientSecret?: string;
  xmlFormat: string;
  xmlNamespace?: string;
  requiresTaxId?: boolean;
  requiresRegNumber?: boolean;
  dateFormat?: string;
  currency: string;
  standardTaxRate: number;
  reducedTaxRate?: number;
}) {
  // Check if country code already exists
  const existing = await prisma.countryConfig.findUnique({
    where: { countryCode: data.countryCode },
  });

  if (existing) {
    throw new Error(`Country with code ${data.countryCode} already exists`);
  }

  const country = await prisma.countryConfig.create({
    data: {
      ...data,
      isActive: true,
    },
  });

  logger.info(`Country configuration created: ${country.countryName}`);

  return country;
}

/**
 * Update country configuration
 */
export async function updateCountry(id: string, data: any) {
  const country = await prisma.countryConfig.update({
    where: { id },
    data,
  });

  logger.info(`Country configuration updated: ${country.countryName}`);

  return country;
}

/**
 * Delete country configuration
 */
export async function deleteCountry(id: string) {
  await prisma.countryConfig.delete({
    where: { id },
  });

  logger.info(`Country configuration deleted: ${id}`);

  return { message: 'Country configuration deleted successfully' };
}

/**
 * Get all users (Super Admin only)
 */
export async function getAllUsers(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get all organizations (Super Admin only)
 */
export async function getAllOrganizationsAdmin(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            users: true,
            invoices: true,
            customers: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.organization.count(),
  ]);

  return {
    organizations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get system statistics (Super Admin only)
 */
export async function getSystemStats() {
  const [totalUsers, totalOrganizations, totalInvoices, totalCustomers, activeCountries] =
    await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.invoice.count(),
      prisma.customer.count(),
      prisma.countryConfig.count({ where: { isActive: true } }),
    ]);

  return {
    totalUsers,
    totalOrganizations,
    totalInvoices,
    totalCustomers,
    activeCountries,
  };
}

/**
 * Create compliance rule
 */
export async function createComplianceRule(data: {
  countryId: string;
  ruleName: string;
  ruleType: string;
  field: string;
  pattern?: string;
  errorMessage: string;
}) {
  const rule = await prisma.complianceRule.create({
    data: {
      ...data,
      isActive: true,
    },
  });

  logger.info(`Compliance rule created: ${rule.ruleName} for country ${data.countryId}`);

  return rule;
}

/**
 * Get compliance rules for country
 */
export async function getCountryComplianceRules(countryId: string) {
  return await prisma.complianceRule.findMany({
    where: { countryId },
    orderBy: { createdAt: 'desc' },
  });
}

