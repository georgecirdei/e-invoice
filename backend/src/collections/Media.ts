import { CollectionConfig } from 'payload/types';
import path from 'path';

const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
  },
  access: {
    create: ({ req: { user } }) => user?.role === 'SUPER_ADMIN',
    read: () => true,
    update: ({ req: { user } }) => user?.role === 'SUPER_ADMIN',
    delete: ({ req: { user } }) => user?.role === 'SUPER_ADMIN',
  },
  upload: {
    staticDir: path.resolve(__dirname, '../../media'),
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
};

export default Media;

