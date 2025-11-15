# E-Invoice Backend API

Backend API for the e-invoice web application built with Node.js, Express, TypeScript, and Prisma.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env with your configuration
   # Make sure to set DATABASE_URL and other required variables
   ```

3. **Start database services (using Docker):**
   ```bash
   # From project root
   docker-compose up -d postgres redis
   ```

4. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```

5. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:8000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Additional models (if needed)
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── app.ts          # Main application file
├── prisma/
│   └── schema.prisma   # Database schema
├── tests/              # Test files
├── .env.example        # Environment variables template
├── package.json
└── tsconfig.json
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## 🔑 Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
NODE_ENV=development
PORT=8000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/einvoice_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

## 📊 Database

This project uses PostgreSQL with Prisma ORM.

### Database Schema

The database includes the following main entities:
- **User** - System users with authentication
- **Organization** - Multi-tenant companies
- **Customer** - Invoice recipients
- **Invoice** - Main invoice documents
- **InvoiceLineItem** - Individual line items
- **RefreshToken** - JWT refresh tokens

### Prisma Commands

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📝 API Documentation

Once the server is running, API documentation will be available at:
- Swagger UI: `http://localhost:8000/api-docs` (to be implemented)

### Available Endpoints

#### Health Check
- `GET /health` - Health check endpoint

#### API Base
- `GET /api/v1` - API information

(More endpoints will be added as development progresses)

## 🔐 Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Helmet.js for security headers
- CORS configuration
- Input validation with Zod
- SQL injection prevention via Prisma

## 🚢 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Using Docker

```bash
# Build Docker image
docker build -t e-invoice-backend .

# Run container
docker run -p 8000:8000 --env-file .env e-invoice-backend
```

## 📚 Development Guide

### Adding a New Endpoint

1. Create a controller in `src/controllers/`
2. Create a service in `src/services/`
3. Add routes in `src/routes/`
4. Register routes in `src/app.ts`
5. Write tests in `tests/`

### Code Style

- Follow TypeScript best practices
- Use ESLint for linting
- Use Prettier for formatting
- Follow conventional commit messages

## 🐛 Troubleshooting

### Common Issues

**Database connection fails:**
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

**Prisma errors:**
- Run `npm run prisma:generate` after schema changes
- Clear node_modules and reinstall if needed

**Port already in use:**
- Change PORT in .env
- Kill process using the port

## 📞 Support

For issues and questions:
1. Check the main [project documentation](../Documentation/)
2. Review error logs
3. Consult the team

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

