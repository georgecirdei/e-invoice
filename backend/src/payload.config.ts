import { buildConfig } from 'payload/config';
import path from 'path';

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-change-in-production',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:8000',
  admin: {
    user: 'users',
  },
  collections: [
    // Collections will be imported here
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  cors: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
  ],
});

