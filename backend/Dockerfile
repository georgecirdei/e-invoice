FROM node:18-slim

WORKDIR /app

# Install OpenSSL and other dependencies for Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Expose port
EXPOSE 8000

# Start the compiled app
CMD ["node", "dist/server.js"]

