import { CollectionConfig } from 'payload/types';

const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isPublished', 'updatedAt'],
    group: 'Content',
  },
  access: {
    create: ({ req: { user } }) => user?.role === 'SUPER_ADMIN',
    read: ({ req }) => {
      if (req.user?.role === 'SUPER_ADMIN') return true;
      return {
        isPublished: { equals: true },
      };
    },
    update: ({ req: { user } }) => user?.role === 'SUPER_ADMIN',
    delete: ({ req: { user } }) => user?.role === 'SUPER_ADMIN',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Page title (used for SEO and display)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL path (e.g., "home", "pricing", "about"). No slashes.',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: {
        description: 'SEO meta description (recommended 150-160 characters)',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Only published pages are visible to public',
        position: 'sidebar',
      },
    },
    {
      name: 'blocks',
      type: 'blocks',
      required: true,
      blocks: [
        {
          slug: 'hero',
          labels: {
            singular: 'Hero Section',
            plural: 'Hero Sections',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'subtitle',
              type: 'textarea',
            },
            {
              name: 'ctaText',
              type: 'text',
              admin: {
                description: 'Call-to-action button text',
              },
            },
            {
              name: 'ctaLink',
              type: 'text',
              admin: {
                description: 'Button link URL',
              },
            },
          ],
        },
        {
          slug: 'features',
          labels: {
            singular: 'Features Section',
            plural: 'Features Sections',
          },
          fields: [
            {
              name: 'heading',
              type: 'text',
            },
            {
              name: 'features',
              type: 'array',
              required: true,
              fields: [
                {
                  name: 'icon',
                  type: 'text',
                  admin: {
                    description: 'Emoji or icon name',
                  },
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                },
              ],
            },
          ],
        },
        {
          slug: 'textSection',
          labels: {
            singular: 'Text Section',
            plural: 'Text Sections',
          },
          fields: [
            {
              name: 'heading',
              type: 'text',
            },
            {
              name: 'content',
              type: 'richText',
            },
          ],
        },
        {
          slug: 'contactForm',
          labels: {
            singular: 'Contact Form',
            plural: 'Contact Forms',
          },
          fields: [
            {
              name: 'heading',
              type: 'text',
              defaultValue: 'Get in Touch',
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'submitText',
              type: 'text',
              defaultValue: 'Send Message',
            },
          ],
        },
        {
          slug: 'cta',
          labels: {
            singular: 'Call to Action',
            plural: 'Call to Actions',
          },
          fields: [
            {
              name: 'heading',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'buttonText',
              type: 'text',
              required: true,
            },
            {
              name: 'buttonLink',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

export default Pages;

