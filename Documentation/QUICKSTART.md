# 🚀 E-Invoice Quick Start Guide

This guide will get you up and running with the e-invoice project in minutes.

## ✅ What's Already Set Up

The project structure has been initialized with:

### Backend
- ✅ Node.js + TypeScript + Express setup
- ✅ Prisma ORM with complete database schema
- ✅ Project structure (controllers, services, routes, middleware)
- ✅ Configuration files (TypeScript, ESLint, Prettier, Jest)
- ✅ Docker Compose for PostgreSQL and Redis
- ✅ Environment configuration templates

### Project Structure
```
e-invoice/
├── backend/                 ✅ Created
│   ├── src/
│   │   ├── config/         ✅ Database config
│   │   ├── controllers/    ✅ Ready
│   │   ├── middleware/     ✅ Ready
│   │   ├── routes/         ✅ Ready
│   │   ├── services/       ✅ Ready
│   │   ├── utils/          ✅ Logger utility
│   │   └── app.ts          ✅ Main app file
│   ├── prisma/
│   │   └── schema.prisma   ✅ Complete schema
│   ├── tests/              ✅ Ready
│   ├── package.json        ✅ Configured
│   ├── tsconfig.json       ✅ Configured
│   └── README.md           ✅ Backend docs
├── frontend/               🔄 To be initialized
├── infrastructure/         ✅ Created
├── docs/                   ✅ Created
├── scripts/                ✅ Created
├── Documentation/          ✅ Complete
├── docker-compose.yml      ✅ PostgreSQL & Redis
├── .gitignore              ✅ Configured
└── README.md               ✅ Project docs
```

## 🏃 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

This will install all required packages:
- Express, Cors, Helmet, Morgan
- Prisma ORM
- JWT, Bcrypt
- TypeScript and development tools

### Step 2: Start Databases

```bash
# From project root
cd ..
docker-compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379

Verify they're running:
```bash
docker ps
```

### Step 3: Set Up Database

```bash
# Go back to backend
cd backend

# Copy environment file
# Note: Create .env manually and copy contents from the structure below

# Run database migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
```

### Step 4: Start Development Server

```bash
# Start backend server
npm run dev
```

Server will start at: **http://localhost:8000**

Test it:
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok","timestamp":"..."}
```

## 📝 Environment Setup

Create a `.env` file in the `backend` directory with:

```env
# Server
NODE_ENV=development
PORT=8000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/einvoice_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

## 📊 Verify Your Setup

### Check Backend
```bash
# Health check
curl http://localhost:8000/health

# API info
curl http://localhost:8000/api/v1
```

### Check Database
```bash
# Open Prisma Studio
cd backend
npm run prisma:studio
```

This opens a GUI at http://localhost:5555 where you can view your database.

### Check Docker Services
```bash
# View running containers
docker ps

# Check PostgreSQL
docker exec -it einvoice-postgres psql -U postgres -d einvoice_dev

# Check Redis
docker exec -it einvoice-redis redis-cli ping
# Should return: PONG
```

## 🎯 Next Steps

Now that your backend is running, you can:

### 1. Initialize Frontend
```bash
# From project root
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir

# Navigate to frontend
cd frontend

# Install additional dependencies
npm install @tanstack/react-query axios react-hook-form zod
```

### 2. Start Building Features

Follow the sprint plan from [IMPLEMENTATION_PLAN.md](./Documentation/IMPLEMENTATION_PLAN.md):

**Sprint 1-2: Authentication Module**
- User registration endpoint
- Login with JWT
- Password hashing
- Refresh tokens
- Frontend login/registration pages

See [GETTING_STARTED.md](./Documentation/GETTING_STARTED.md) for detailed instructions.

### 3. Run Tests
```bash
cd backend
npm test
```

### 4. Explore Prisma
```bash
# Generate ERD diagram (requires graphviz)
npm run prisma:studio

# View your data models
# Edit prisma/schema.prisma for any changes
# Run migrations after changes
npm run prisma:migrate
```

## 🛠️ Useful Commands

### Backend Development
```bash
cd backend

# Development with hot reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Start production server
npm start
```

### Database Operations
```bash
cd backend

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (careful!)
npx prisma migrate reset

# Open Prisma Studio
npm run prisma:studio

# Generate Prisma Client after schema changes
npm run prisma:generate
```

### Docker Operations
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart postgres
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000                  # Mac/Linux

# Kill the process or change PORT in .env
```

### Database Connection Error
1. Check if PostgreSQL is running: `docker ps`
2. Verify DATABASE_URL in .env
3. Ensure database exists: `docker exec -it einvoice-postgres psql -U postgres -l`

### Prisma Errors
```bash
# Clear and regenerate
rm -rf node_modules
npm install
npm run prisma:generate
```

### Cannot Find Module Errors
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation

- **[START_HERE.md](./Documentation/START_HERE.md)** - Documentation overview
- **[IMPLEMENTATION_PLAN.md](./Documentation/IMPLEMENTATION_PLAN.md)** - 12-month roadmap
- **[GETTING_STARTED.md](./Documentation/GETTING_STARTED.md)** - Detailed setup guide
- **[PROJECT_OVERVIEW.md](./Documentation/PROJECT_OVERVIEW.md)** - Technical architecture
- **[SETUP_CHECKLIST.md](./Documentation/SETUP_CHECKLIST.md)** - Progress tracker

## 🎉 You're All Set!

Your backend is now running with:
- ✅ Express API server
- ✅ PostgreSQL database
- ✅ Redis caching
- ✅ Prisma ORM
- ✅ TypeScript
- ✅ Hot reload
- ✅ Testing framework
- ✅ Linting & formatting

**Ready to build features!** 🚀

Start with Sprint 1: Authentication Module
- See [IMPLEMENTATION_PLAN.md](./Documentation/IMPLEMENTATION_PLAN.md) Section 4.2

---

**Need help?** Check the [Documentation](./Documentation/) folder or review the backend [README.md](./backend/README.md).

