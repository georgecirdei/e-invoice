# Getting Started with E-Invoice Development

This guide will help you set up your development environment and start building the e-invoice web application.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Technology Stack Decision](#technology-stack-decision)
4. [Project Initialization](#project-initialization)
5. [Development Workflow](#development-workflow)
6. [First Sprint Goals](#first-sprint-goals)

## Prerequisites

### Required Software

Before starting, install the following on your development machine:

#### 1. Node.js and npm
```bash
# Download from https://nodejs.org/ (LTS version recommended)
# Verify installation
node --version  # Should be v18 or higher
npm --version   # Should be v9 or higher
```

#### 2. Git
```bash
# Download from https://git-scm.com/
# Verify installation
git --version
```

#### 3. PostgreSQL
```bash
# Download from https://www.postgresql.org/download/
# Or use Docker:
docker run --name postgres-einvoice -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

#### 4. Redis
```bash
# Download from https://redis.io/download
# Or use Docker:
docker run --name redis-einvoice -p 6379:6379 -d redis:7
```

#### 5. Code Editor
- Visual Studio Code (recommended) with extensions:
  - ESLint
  - Prettier
  - GitLens
  - Thunder Client (for API testing)
  - Docker (if using containers)

### Optional Tools
- **Docker Desktop**: For containerized development
- **Postman**: For API testing
- **pgAdmin**: PostgreSQL GUI
- **RedisInsight**: Redis GUI

## Initial Setup

### 1. Choose Your Backend Technology

#### Option A: Node.js with Express/NestJS

**Pros:**
- Same language (JavaScript/TypeScript) for frontend and backend
- Large ecosystem and community
- Excellent for real-time features
- Fast development cycle

**Cons:**
- May require more careful handling for CPU-intensive tasks

**Initial Setup:**
```bash
# Create backend directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express cors dotenv helmet morgan
npm install jsonwebtoken bcryptjs pg redis

# Install TypeScript and dev dependencies
npm install -D typescript @types/node @types/express
npm install -D nodemon ts-node @types/jsonwebtoken @types/bcryptjs

# Initialize TypeScript
npx tsc --init
```

#### Option B: Python with FastAPI/Django

**Pros:**
- Excellent for data processing and AI/ML features
- Strong typing with Python 3.10+
- FastAPI is extremely fast and modern
- Great for complex business logic

**Cons:**
- Different language from frontend
- Slightly longer deployment process

**Initial Setup:**
```bash
# Create backend directory
mkdir backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install core dependencies
pip install fastapi uvicorn[standard]
pip install sqlalchemy psycopg2-binary alembic
pip install python-jose[cryptography] passlib[bcrypt]
pip install python-dotenv redis

# Create requirements.txt
pip freeze > requirements.txt
```

### 2. Initialize Frontend

```bash
# Create Next.js app with TypeScript
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir

# Navigate to frontend
cd frontend

# Install additional dependencies
npm install @tanstack/react-query axios
npm install react-hook-form zod @hookform/resolvers
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
# OR if using shadcn/ui
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# Install dev dependencies
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D cypress
```

### 3. Setup Project Structure

Create the following directory structure:

```bash
e-invoice/
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts     # Database configuration
│   │   ├── controllers/
│   │   │   └── auth.controller.ts
│   │   ├── models/
│   │   │   └── user.model.ts
│   │   ├── routes/
│   │   │   └── auth.routes.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── utils/
│   │   │   └── logger.ts
│   │   └── app.ts              # Main application file
│   ├── tests/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js app directory
│   │   ├── components/
│   │   │   ├── common/         # Reusable components
│   │   │   ├── layout/         # Layout components
│   │   │   └── features/       # Feature-specific components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API services
│   │   ├── store/              # State management
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utility functions
│   ├── public/
│   ├── .env.local.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
├── docs/
├── infrastructure/
│   └── docker/
│       ├── Dockerfile.backend
│       └── Dockerfile.frontend
├── scripts/
├── .gitignore
├── docker-compose.yml
├── IMPLEMENTATION_PLAN.md
├── README.md
└── GETTING_STARTED.md
```

### 4. Create Configuration Files

#### Backend .env.example
```env
# Server Configuration
NODE_ENV=development
PORT=8000
API_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/einvoice_dev
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug

# Government API (example for Malaysia IRBM)
GOV_API_BASE_URL=https://api.myinvois.hasil.gov.my
GOV_API_CLIENT_ID=your-client-id
GOV_API_CLIENT_SECRET=your-client-secret

# Cloud Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=us-east-1

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

#### Frontend .env.local.example
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=E-Invoice
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_ENVIRONMENT=development

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=false
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: einvoice-postgres
    environment:
      POSTGRES_DB: einvoice_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: einvoice-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: ../infrastructure/docker/Dockerfile.backend
    container_name: einvoice-backend
    ports:
      - "8000:8000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/einvoice_dev
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: ../infrastructure/docker/Dockerfile.frontend
    container_name: einvoice-frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
```

## Technology Stack Decision

Based on the project requirements, here's the recommended stack:

### Frontend Stack ✅
- **Framework**: Next.js 14+ (React 18+)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand (simpler) or Redux Toolkit (more complex apps)
- **Forms**: React Hook Form + Zod validation
- **API Client**: Axios with TanStack Query (React Query)
- **Charts**: Recharts
- **Testing**: Jest + React Testing Library + Cypress

### Backend Stack ✅
- **Runtime**: Node.js with Express.js (or NestJS for more structure)
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

### Database Stack ✅
- **Primary Database**: PostgreSQL 15+
- **Caching**: Redis 7+
- **File Storage**: AWS S3 (or compatible service)

### DevOps Stack ✅
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: AWS (or Azure/GCP)
- **Monitoring**: Prometheus + Grafana

## Project Initialization

### 1. Initialize Git Repository

```bash
# In the project root
git init
git add .
git commit -m "Initial project setup"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/your-username/e-invoice.git
git branch -M main
git push -u origin main
```

### 2. Setup Database Schema with Prisma

```bash
cd backend

# Install Prisma
npm install prisma @prisma/client
npm install -D prisma

# Initialize Prisma
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env file
```

Create initial schema (`prisma/schema.prisma`):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  firstName     String?
  lastName      String?
  role          UserRole  @default(USER)
  isActive      Boolean   @default(true)
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  organization  Organization? @relation(fields: [organizationId], references: [id])
  organizationId String?
  
  invoices      Invoice[]
  refreshTokens RefreshToken[]
  
  @@index([email])
  @@index([organizationId])
}

model Organization {
  id                String   @id @default(cuid())
  name              String
  taxId             String   @unique
  registrationNumber String? @unique
  email             String
  phone             String?
  address           String?
  city              String?
  state             String?
  country           String
  postalCode        String?
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  users             User[]
  invoices          Invoice[]
  customers         Customer[]
  
  @@index([taxId])
}

model Customer {
  id                 String   @id @default(cuid())
  name               String
  email              String
  taxId              String?
  registrationNumber String?
  phone              String?
  address            String?
  city               String?
  state              String?
  country            String
  postalCode         String?
  isActive           Boolean  @default(true)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  organization       Organization @relation(fields: [organizationId], references: [id])
  organizationId     String
  
  invoices           Invoice[]
  
  @@index([organizationId])
  @@index([email])
}

model Invoice {
  id                 String        @id @default(cuid())
  invoiceNumber      String        @unique
  invoiceDate        DateTime
  dueDate            DateTime?
  status             InvoiceStatus @default(DRAFT)
  currency           String        @default("USD")
  subtotal           Decimal       @db.Decimal(19, 4)
  taxAmount          Decimal       @db.Decimal(19, 4)
  totalAmount        Decimal       @db.Decimal(19, 4)
  notes              String?
  
  pdfUrl             String?
  xmlData            String?       @db.Text
  qrCode             String?
  
  submittedAt        DateTime?
  validatedAt        DateTime?
  governmentId       String?
  governmentStatus   String?
  
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
  
  organization       Organization  @relation(fields: [organizationId], references: [id])
  organizationId     String
  
  customer           Customer      @relation(fields: [customerId], references: [id])
  customerId         String
  
  createdBy          User          @relation(fields: [createdById], references: [id])
  createdById        String
  
  lineItems          InvoiceLineItem[]
  
  @@index([organizationId])
  @@index([customerId])
  @@index([invoiceNumber])
  @@index([status])
}

model InvoiceLineItem {
  id          String   @id @default(cuid())
  description String
  quantity    Decimal  @db.Decimal(19, 4)
  unitPrice   Decimal  @db.Decimal(19, 4)
  taxRate     Decimal  @db.Decimal(5, 2)
  taxAmount   Decimal  @db.Decimal(19, 4)
  totalAmount Decimal  @db.Decimal(19, 4)
  
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  invoiceId   String
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([invoiceId])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  
  @@index([userId])
  @@index([token])
}

enum UserRole {
  ADMIN
  MANAGER
  USER
  VIEWER
}

enum InvoiceStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  SUBMITTED
  VALIDATED
  REJECTED
  CANCELLED
}
```

Run migration:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Create Basic API Structure

Create a simple Express server (`backend/src/app.ts`):

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes will be added here
app.get('/api/v1', (req, res) => {
  res.json({ message: 'E-Invoice API v1' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});

export default app;
```

## Development Workflow

### Daily Workflow

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/user-authentication
   ```

3. **Start development servers**
   ```bash
   # Terminal 1: Start database services
   docker-compose up postgres redis

   # Terminal 2: Start backend
   cd backend
   npm run dev

   # Terminal 3: Start frontend
   cd frontend
   npm run dev
   ```

4. **Make changes and test**

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: implement user authentication"
   git push origin feature/user-authentication
   ```

6. **Create Pull Request**

### Git Commit Convention

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Build/tooling changes

## First Sprint Goals

### Sprint 1-2: Foundation (4 weeks)

#### Week 1: Setup & Architecture
- [ ] Complete development environment setup
- [ ] Finalize technology stack
- [ ] Create project structure
- [ ] Setup CI/CD pipeline basics
- [ ] Design database schema
- [ ] Create initial API documentation

#### Week 2: Authentication Backend
- [ ] User registration endpoint
- [ ] Login endpoint with JWT
- [ ] Password hashing with bcrypt
- [ ] Refresh token mechanism
- [ ] Email verification (basic)
- [ ] Password reset flow

#### Week 3: Authentication Frontend
- [ ] Login page UI
- [ ] Registration page UI
- [ ] Password reset UI
- [ ] Protected route wrapper
- [ ] Auth state management
- [ ] API client setup

#### Week 4: Testing & Polish
- [ ] Unit tests for auth endpoints
- [ ] Integration tests for auth flow
- [ ] Frontend auth tests
- [ ] Error handling improvements
- [ ] Loading states and UX polish
- [ ] Documentation updates

### Deliverables by End of Sprint 2
- ✅ Working authentication system
- ✅ User can register, login, and reset password
- ✅ Protected routes in frontend
- ✅ Test coverage > 70% for auth module
- ✅ API documentation for auth endpoints
- ✅ Deployed to development environment

## Next Steps

After completing this guide:

1. Review the [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed sprint planning
2. Set up your development environment
3. Create your first feature branch
4. Start with Sprint 1 tasks
5. Regular team syncs and code reviews

## Resources

### Learning Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### API References
- [Malaysia MyInvois API](https://sdk.myinvois.hasil.gov.my/)
- [Saudi Arabia ZATCA E-Invoicing](https://zatca.gov.sa/en/E-Invoicing/Introduction/Pages/default.aspx)

### Tools & Utilities
- [Postman](https://www.postman.com/) - API testing
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL GUI
- [RedisInsight](https://redis.io/insight/) - Redis GUI
- [Excalidraw](https://excalidraw.com/) - Diagrams

## Support

If you encounter issues:
1. Check the troubleshooting section in README.md
2. Review error logs carefully
3. Search for similar issues in documentation
4. Ask the team in your communication channel

---

**Happy Coding! 🚀**

