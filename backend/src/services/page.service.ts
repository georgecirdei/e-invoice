import prisma from '../config/database';
import logger from '../utils/logger';

/**
 * Get all pages (Super Admin)
 */
export async function getAllPages() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: 'desc' },
  });
  return pages;
}

/**
 * Get published page by slug (Public)
 */
export async function getPublishedPageBySlug(slug: string) {
  const page = await prisma.page.findFirst({
    where: {
      slug,
      isPublished: true,
    },
  });
  return page;
}

/**
 * Get page by ID (Super Admin)
 */
export async function getPageById(id: string) {
  const page = await prisma.page.findUnique({
    where: { id },
  });
  return page;
}

/**
 * Create page
 */
export async function createPage(data: {
  title: string;
  slug: string;
  metaDescription?: string;
  blocks: any;
  isPublished?: boolean;
}) {
  const page = await prisma.page.create({
    data,
  });

  logger.info(`Page created: ${page.title} (${page.slug})`);
  return page;
}

/**
 * Update page
 */
export async function updatePage(id: string, data: any) {
  const page = await prisma.page.update({
    where: { id },
    data,
  });

  logger.info(`Page updated: ${page.title}`);
  return page;
}

/**
 * Delete page
 */
export async function deletePage(id: string) {
  await prisma.page.delete({
    where: { id },
  });

  logger.info(`Page deleted: ${id}`);
  return { message: 'Page deleted successfully' };
}

/**
 * Submit contact form
 */
export async function submitContactForm(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  const submission = await prisma.contactFormSubmission.create({
    data,
  });

  logger.info(`Contact form submitted: ${data.email}`);
  return submission;
}

/**
 * Get all contact submissions (Super Admin)
 */
export async function getAllContactSubmissions() {
  const submissions = await prisma.contactFormSubmission.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return submissions;
}

/**
 * Update contact submission status
 */
export async function updateContactStatus(id: string, status: string) {
  const submission = await prisma.contactFormSubmission.update({
    where: { id },
    data: { status },
  });
  return submission;
}

