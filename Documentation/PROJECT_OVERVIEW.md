# E-Invoice Project Overview

## Quick Reference Guide

This document provides a quick overview of the project structure, key decisions, and important information for developers.

---

## 🎯 Project Goals

1. **Compliance First**: Build a fully compliant e-invoicing system meeting government regulations
2. **User-Friendly**: Create an intuitive interface that requires minimal training
3. **Scalable**: Design architecture that can handle growth from SMBs to enterprises
4. **Integration-Ready**: Provide robust APIs for ERP and accounting system integration
5. **Secure**: Implement enterprise-grade security and data protection

---

## 📊 Key Statistics & Targets

| Metric | Target |
|--------|--------|
| System Uptime | 99.9% |
| API Response Time | < 200ms (p95) |
| Invoice Processing Time | < 5 minutes |
| Test Coverage | > 80% |
| User Adoption (6 months) | 80% of target users |
| First-time Compliance Success | > 99% |

---

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│  • Web Browser (Desktop/Mobile)                         │
│  • Mobile Apps (Future)                                 │
│  • Third-party Integrations (via API)                   │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│              Frontend Application (Next.js)             │
│  • Server-Side Rendering (SSR)                          │
│  • Static Site Generation (SSG)                         │
│  • API Route Handlers                                   │
│  • Progressive Web App (PWA)                            │
└─────────────────────────────────────────────────────────┘
                          ↓ REST API
┌─────────────────────────────────────────────────────────┐
│               API Gateway / Load Balancer               │
│  • Rate Limiting                                        │
│  • Request Routing                                      │
│  • SSL Termination                                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│            Backend Application (Node.js)                │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Authentication & Authorization Layer              │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Business Logic Layer                              │  │
│  │  • Invoice Processing                             │  │
│  │  • Tax Calculation                                │  │
│  │  • Validation Engine                              │  │
│  │  • Compliance Rules                               │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Services Layer                                    │  │
│  │  • Document Generation (PDF/XML)                  │  │
│  │  • Email/SMS Service                              │  │
│  │  • File Storage Service                           │  │
│  │  • Government API Client                          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────┬──────────────────┬──────────────────┐
│   PostgreSQL     │      Redis       │   Cloud Storage  │
│ (Primary Data)   │   (Cache/Queue)  │   (Documents)    │
└──────────────────┴──────────────────┴──────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              External Services                          │
│  • Government E-Invoice API                             │
│  • Payment Gateways                                     │
│  • Email/SMS Providers                                  │
│  • ERP Systems                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend Stack

| Component | Technology | Why Chosen |
|-----------|-----------|------------|
| Framework | Next.js 14+ | SSR/SSG, excellent DX, performance |
| Language | TypeScript | Type safety, better tooling |
| Styling | Tailwind CSS + shadcn/ui | Utility-first, consistent design |
| State Management | Zustand | Simple, lightweight, performant |
| Forms | React Hook Form + Zod | Best performance, great DX |
| API Client | Axios + React Query | Caching, automatic retries, optimistic updates |
| Charts | Recharts | React-native, declarative |
| Testing | Jest + Cypress | Unit + E2E coverage |

### Backend Stack

| Component | Technology | Why Chosen |
|-----------|-----------|------------|
| Runtime | Node.js 18+ | JavaScript ecosystem, async I/O |
| Framework | Express.js | Minimal, flexible, proven |
| Language | TypeScript | Type safety across stack |
| ORM | Prisma | Type-safe queries, excellent DX |
| Authentication | JWT | Stateless, scalable |
| Validation | Zod | Type-safe validation, shared with frontend |
| API Docs | Swagger/OpenAPI | Industry standard |
| Testing | Jest + Supertest | Comprehensive testing |

### Database & Infrastructure

| Component | Technology | Why Chosen |
|-----------|-----------|------------|
| Database | PostgreSQL 15+ | ACID compliance, JSON support, mature |
| Cache | Redis 7+ | Fast, versatile, pub/sub support |
| File Storage | AWS S3 | Scalable, reliable, cost-effective |
| Containers | Docker | Consistency across environments |
| Orchestration | Docker Compose (dev), K8s (prod) | Scalable deployment |
| CI/CD | GitHub Actions | Native integration, free for public repos |

---

## 📁 Project Structure

```
e-invoice/
│
├── .github/                    # GitHub specific files
│   └── workflows/             # CI/CD workflows
│       ├── backend-ci.yml
│       ├── frontend-ci.yml
│       └── deploy.yml
│
├── backend/                   # Backend application
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   │   ├── database.ts
│   │   │   └── redis.ts
│   │   ├── controllers/      # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── invoice.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── middleware/       # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   ├── models/          # Database models (if not using Prisma)
│   │   ├── routes/          # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── invoice.routes.ts
│   │   │   └── index.ts
│   │   ├── services/        # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── invoice.service.ts
│   │   │   ├── pdf.service.ts
│   │   │   ├── email.service.ts
│   │   │   └── government-api.service.ts
│   │   ├── utils/           # Utility functions
│   │   │   ├── logger.ts
│   │   │   ├── crypto.ts
│   │   │   └── validators.ts
│   │   ├── types/           # TypeScript type definitions
│   │   └── app.ts           # Main application file
│   ├── prisma/              # Prisma ORM files
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── tests/               # Test files
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── frontend/                 # Frontend application
│   ├── src/
│   │   ├── app/             # Next.js app directory (routes)
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── invoices/
│   │   │   │   ├── customers/
│   │   │   │   └── reports/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/      # React components
│   │   │   ├── common/     # Reusable components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Table.tsx
│   │   │   ├── layout/     # Layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── features/   # Feature-specific components
│   │   │       ├── invoices/
│   │   │       ├── customers/
│   │   │       └── reports/
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useInvoice.ts
│   │   │   └── useDebounce.ts
│   │   ├── services/       # API client services
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   └── invoice.service.ts
│   │   ├── store/          # State management
│   │   │   ├── authStore.ts
│   │   │   └── invoiceStore.ts
│   │   ├── types/          # TypeScript types
│   │   │   ├── invoice.types.ts
│   │   │   └── user.types.ts
│   │   ├── utils/          # Utility functions
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   │   ├── images/
│   │   └── fonts/
│   ├── .env.local.example
│   ├── .gitignore
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
│
├── docs/                    # Documentation
│   ├── api/                # API documentation
│   │   ├── README.md
│   │   └── endpoints/
│   ├── architecture/       # Architecture docs
│   │   ├── README.md
│   │   ├── diagrams/
│   │   └── decisions/
│   └── guides/            # User guides
│       ├── user-manual.md
│       ├── admin-guide.md
│       └── developer-guide.md
│
├── infrastructure/         # Infrastructure as Code
│   ├── docker/
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   └── docker-compose.yml
│   ├── kubernetes/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   └── terraform/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
├── scripts/               # Utility scripts
│   ├── seed-database.ts
│   ├── migrate.sh
│   └── backup.sh
│
├── .gitignore
├── docker-compose.yml
├── IMPLEMENTATION_PLAN.md  # Detailed implementation plan
├── GETTING_STARTED.md      # Getting started guide
├── PROJECT_OVERVIEW.md     # This file
└── README.md               # Project README
```

---

## 🔐 Security Considerations

### Authentication & Authorization
- JWT tokens with refresh token rotation
- Password hashing with bcrypt (cost factor 12)
- Multi-factor authentication (MFA) optional
- Role-based access control (RBAC)
- Session management with Redis

### Data Protection
- All data encrypted in transit (TLS 1.3)
- Sensitive data encrypted at rest
- PII (Personally Identifiable Information) handling
- GDPR compliance measures
- Regular security audits

### API Security
- Rate limiting (per IP and per user)
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF protection
- CORS configuration
- Security headers (helmet.js)

### Infrastructure Security
- Private subnets for databases
- VPC configuration
- Firewall rules
- Regular backups
- Disaster recovery plan
- Monitoring and alerting

---

## 📊 Database Schema Overview

### Core Entities

#### Users & Organizations
- **User**: System users with authentication
- **Organization**: Multi-tenant companies
- **Customer**: Invoice recipients

#### Invoicing
- **Invoice**: Main invoice document
- **InvoiceLineItem**: Individual line items
- **InvoiceTemplate**: Reusable templates

#### System
- **RefreshToken**: JWT refresh tokens
- **AuditLog**: Activity tracking
- **Setting**: System configuration

### Key Relationships
```
Organization (1) ──── (*) User
Organization (1) ──── (*) Customer
Organization (1) ──── (*) Invoice
Invoice (1) ──── (*) InvoiceLineItem
Invoice (*) ──── (1) Customer
Invoice (*) ──── (1) User (creator)
```

---

## 🔄 API Design Principles

### RESTful Endpoints

```
Base URL: /api/v1

Authentication:
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password

Users:
GET    /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id
GET    /users/me
PUT    /users/me

Organizations:
GET    /organizations
GET    /organizations/:id
PUT    /organizations/:id
POST   /organizations/:id/users

Customers:
GET    /customers
POST   /customers
GET    /customers/:id
PUT    /customers/:id
DELETE /customers/:id

Invoices:
GET    /invoices
POST   /invoices
GET    /invoices/:id
PUT    /invoices/:id
DELETE /invoices/:id
POST   /invoices/:id/submit
POST   /invoices/:id/cancel
GET    /invoices/:id/pdf
GET    /invoices/:id/xml

Reports:
GET    /reports/dashboard
GET    /reports/invoices
GET    /reports/tax
POST   /reports/custom
```

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [...]
  }
}
```

### Status Codes
- `200` OK - Successful GET, PUT, DELETE
- `201` Created - Successful POST
- `400` Bad Request - Validation errors
- `401` Unauthorized - Authentication required
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `429` Too Many Requests - Rate limit exceeded
- `500` Internal Server Error - Server error

---

## 🧪 Testing Strategy

### Test Pyramid

```
          /\
         /  \    E2E Tests (10%)
        /────\   - User workflows
       /      \  - Critical paths
      /────────\  
     /          \ Integration Tests (30%)
    /────────────\ - API endpoints
   /              \ - Database operations
  /────────────────\
 /                  \ Unit Tests (60%)
/────────────────────\ - Functions
                       - Components
                       - Services
```

### Coverage Requirements
- Overall: > 80%
- Critical paths: 100%
- Business logic: > 90%
- UI components: > 70%

---

## 📈 Performance Targets

### Frontend
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms

### Backend
- API Response Time (p50): < 100ms
- API Response Time (p95): < 200ms
- API Response Time (p99): < 500ms
- Database Query Time: < 50ms
- Throughput: > 1000 req/s

### Infrastructure
- System Uptime: 99.9%
- Database Uptime: 99.99%
- Backup Success Rate: 100%
- Recovery Time Objective (RTO): < 1 hour
- Recovery Point Objective (RPO): < 15 minutes

---

## 🚀 Deployment Strategy

### Environments
1. **Development**: Local development
2. **Staging**: QA and testing
3. **Production**: Live system

### Deployment Process
1. Code review and approval
2. Automated tests pass
3. Build and containerize
4. Deploy to staging
5. Smoke tests
6. Deploy to production (blue-green)
7. Monitor and verify
8. Rollback if needed

### CI/CD Pipeline
```
Code Push → Tests → Build → Deploy to Staging → 
Manual Approval → Deploy to Production → Monitor
```

---

## 📞 Key Contacts & Resources

### Team Roles
- **Project Manager**: TBD
- **Tech Lead**: TBD
- **Frontend Lead**: TBD
- **Backend Lead**: TBD
- **DevOps Lead**: TBD
- **QA Lead**: TBD

### External Resources
- Government API Documentation
- Cloud Provider Support
- Third-party Service Support

---

## 📅 Important Dates

| Milestone | Target Date |
|-----------|-------------|
| Project Kickoff | Month 1, Week 1 |
| Design Review | Month 1, Week 3 |
| MVP Release | Month 6, Week 4 |
| Beta Testing | Month 10, Week 1 |
| UAT | Month 11, Week 1 |
| Production Launch | Month 12, Week 3 |

---

## 🔗 Quick Links

- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- [Getting Started Guide](./GETTING_STARTED.md)
- [README](../README.md)
- [API Documentation](../docs/api/README.md)
- [Architecture Docs](../docs/architecture/README.md)

---

## 📝 Notes

### Design Decisions
- Chose Next.js for SSR capabilities and SEO
- Prisma for type-safe database access
- PostgreSQL for ACID compliance
- Redis for caching and session management
- Monorepo structure for easier development

### Trade-offs
- Slightly more complex initial setup vs long-term maintainability
- TypeScript overhead vs type safety benefits
- Microservices complexity vs monolith simplicity (chose monolith first)

### Future Considerations
- Mobile app development (React Native)
- Microservices architecture (if scaling requires)
- Advanced analytics with machine learning
- Blockchain integration for document verification
- Multi-language support (i18n)

---

## 📊 Current Implementation Status

**Project Phase**: Sprint 7 Week 2-3 Complete ✅ - Core Invoice Features Functional

### Completed Components

#### Backend (100% Complete) ✅
- ✅ Node.js + Express + TypeScript setup
- ✅ PostgreSQL database with Prisma ORM
- ✅ Complete database schema (User, Organization, Customer, Invoice, LineItem)
- ✅ Authentication system (register, login, refresh, logout)
- ✅ Organization management (CRUD, members, roles)
- ✅ Customer management (CRUD, search, filtering)
- ✅ Invoice management (CRUD, submit, statistics)
- ✅ Tax calculation engine
- ✅ Invoice number generation (auto)
- ✅ JWT token management
- ✅ Password hashing with bcrypt
- ✅ Protected routes middleware
- ✅ Role-based authorization
- ✅ Error handling
- ✅ Input validation with Zod
- ✅ 24 API endpoints operational

#### Frontend (100% Complete) ✅
- ✅ Next.js 15 + React 19 + TypeScript setup
- ✅ Tailwind CSS styling
- ✅ Login & Registration pages
- ✅ Dashboard with real-time stats
- ✅ Organization setup & settings
- ✅ Member management
- ✅ Customer management (list, add, edit)
- ✅ Invoice creation with dynamic line items
- ✅ Invoice list with search & filters
- ✅ Invoice detail view
- ✅ Protected routes
- ✅ Auth state management (Zustand)
- ✅ API client with Axios
- ✅ Form validation with React Hook Form + Zod
- ✅ Reusable UI components
- ✅ Responsive design (mobile/desktop)

#### Infrastructure (100% Complete) ✅
- ✅ Docker Compose (PostgreSQL + Redis)
- ✅ Git repository configured
- ✅ One-click launch scripts (dev.ps1)
- ✅ VS Code integration (F5 debugging)
- ✅ Project structure organized
- ✅ Documentation complete and updated

### Current Status
```
✅ Backend API Server: Running on port 8000 (24 endpoints)
✅ PostgreSQL Database: Running on port 5432
✅ Redis Cache: Running on port 6379
✅ Frontend Application: Running on port 3000
✅ Authentication: Fully functional
✅ Organizations: Multi-tenant ready
✅ Customers: Complete database
✅ Invoices: Creation and management operational
✅ Tax Calculations: Automatic
```

### Functional Features
```
✅ User registration and login
✅ JWT authentication with refresh tokens
✅ Multi-tenant organization support
✅ Team member management with roles
✅ Customer database management
✅ Invoice creation with multiple line items
✅ Automatic tax calculation
✅ Invoice status workflow
✅ Search and filtering
✅ Real-time statistics
✅ Responsive UI
```

### Next Sprint
📋 **Sprint 7 Week 6**: Document Generation
- PDF invoice generation
- XML export (government format)
- QR code generation
- Email delivery
- Document storage

---

**Last Updated**: November 12, 2025 - 18:10 CET  
**Version**: 2.0 (Sprint 7 Complete - Invoice Management Functional)  
**Next Review**: December 12, 2025

