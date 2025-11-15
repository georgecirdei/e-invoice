import prisma from '../config/database';
import logger from '../utils/logger';

interface CreateOrganizationData {
  name: string;
  taxId: string;
  registrationNumber?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
  userId: string; // User creating the organization
}

interface UpdateOrganizationData {
  name?: string;
  taxId?: string;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isActive?: boolean;
}

/**
 * Create a new organization
 */
export async function createOrganization(data: CreateOrganizationData) {
  const { userId, ...organizationData } = data;

  // Check if organization with this taxId already exists
  const existingOrg = await prisma.organization.findUnique({
    where: { taxId: data.taxId },
  });

  if (existingOrg) {
    throw new Error('Organization with this Tax ID already exists');
  }

  // Check if registration number is unique (if provided)
  if (data.registrationNumber) {
    const existingRegNum = await prisma.organization.findUnique({
      where: { registrationNumber: data.registrationNumber },
    });

    if (existingRegNum) {
      throw new Error('Organization with this registration number already exists');
    }
  }

  // Create organization and link the creating user
  const organization = await prisma.organization.create({
    data: {
      ...organizationData,
      users: {
        connect: { id: userId },
      },
    },
    include: {
      users: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  // Update user to set them as ADMIN of their organization
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'ADMIN' },
  });

  logger.info(`Organization created: ${organization.name} by user ${userId}`);

  return organization;
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(organizationId: string, userId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      users: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          invoices: true,
          customers: true,
        },
      },
    },
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  // Check if user belongs to this organization
  const userBelongs = organization.users.some(u => u.id === userId);
  if (!userBelongs) {
    throw new Error('You do not have access to this organization');
  }

  return organization;
}

/**
 * Get user's organization
 */
export async function getUserOrganization(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: {
        include: {
          _count: {
            select: {
              users: true,
              invoices: true,
              customers: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user.organization;
}

/**
 * Update organization
 */
export async function updateOrganization(
  organizationId: string,
  userId: string,
  data: UpdateOrganizationData
) {
  // Verify user belongs to organization and is admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true, role: true },
  });

  if (!user || user.organizationId !== organizationId) {
    throw new Error('You do not have access to this organization');
  }

  if (user.role !== 'ADMIN') {
    throw new Error('Only administrators can update organization details');
  }

  // Check if taxId is being changed and is unique
  if (data.taxId) {
    const existingOrg = await prisma.organization.findUnique({
      where: { taxId: data.taxId },
    });

    if (existingOrg && existingOrg.id !== organizationId) {
      throw new Error('Organization with this Tax ID already exists');
    }
  }

  // Update organization
  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data,
    include: {
      users: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  logger.info(`Organization updated: ${organizationId} by user ${userId}`);

  return organization;
}

/**
 * Get all organizations (for admin purposes)
 */
export async function getAllOrganizations(page: number = 1, limit: number = 10) {
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
 * Add user to organization
 */
export async function addUserToOrganization(
  organizationId: string,
  userEmail: string,
  role: string,
  adminUserId: string
) {
  // Verify admin has permission
  const admin = await prisma.user.findUnique({
    where: { id: adminUserId },
    select: { organizationId: true, role: true },
  });

  if (!admin || admin.organizationId !== organizationId || admin.role !== 'ADMIN') {
    throw new Error('Only organization administrators can add members');
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    throw new Error('User not found with this email');
  }

  if (user.organizationId) {
    throw new Error('User is already part of an organization');
  }

  // Add user to organization
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      organizationId,
      role: role as any,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  logger.info(`User ${userEmail} added to organization ${organizationId}`);

  return updatedUser;
}

/**
 * Remove user from organization
 */
export async function removeUserFromOrganization(
  organizationId: string,
  userIdToRemove: string,
  adminUserId: string
) {
  // Verify admin has permission
  const admin = await prisma.user.findUnique({
    where: { id: adminUserId },
    select: { organizationId: true, role: true },
  });

  if (!admin || admin.organizationId !== organizationId || admin.role !== 'ADMIN') {
    throw new Error('Only organization administrators can remove members');
  }

  // Can't remove yourself
  if (userIdToRemove === adminUserId) {
    throw new Error('You cannot remove yourself from the organization');
  }

  // Remove user from organization
  const updatedUser = await prisma.user.update({
    where: { id: userIdToRemove },
    data: {
      organizationId: null,
      role: 'USER', // Reset to default role
    },
  });

  logger.info(`User ${userIdToRemove} removed from organization ${organizationId}`);

  return updatedUser;
}

/**
 * Update user role in organization
 */
export async function updateUserRole(
  organizationId: string,
  userIdToUpdate: string,
  newRole: string,
  adminUserId: string
) {
  // Verify admin has permission
  const admin = await prisma.user.findUnique({
    where: { id: adminUserId },
    select: { organizationId: true, role: true },
  });

  if (!admin || admin.organizationId !== organizationId || admin.role !== 'ADMIN') {
    throw new Error('Only organization administrators can update user roles');
  }

  // Can't change your own role
  if (userIdToUpdate === adminUserId) {
    throw new Error('You cannot change your own role');
  }

  // Update user role
  const updatedUser = await prisma.user.update({
    where: { id: userIdToUpdate },
    data: { role: newRole as any },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  logger.info(`User ${userIdToUpdate} role updated to ${newRole} in organization ${organizationId}`);

  return updatedUser;
}

