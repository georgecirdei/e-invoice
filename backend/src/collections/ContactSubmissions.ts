import { CollectionConfig } from 'payload/types';

const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'status', 'createdAt'],
    group: 'Content',
  },
  access: {
    create: () => true, // Anyone can submit contact form
    read: ({ req: { user } }) => user?.role === 'SUPER_ADMIN',
    update: ({ req: { user } }) => user?.role === 'SUPER_ADMIN',
    delete: ({ req: { user } }) => user?.role === 'SUPER_ADMIN',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'subject',
      type: 'text',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'New',
          value: 'new',
        },
        {
          label: 'In Progress',
          value: 'in-progress',
        },
        {
          label: 'Resolved',
          value: 'resolved',
        },
      ],
      defaultValue: 'new',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
};

export default ContactSubmissions;

