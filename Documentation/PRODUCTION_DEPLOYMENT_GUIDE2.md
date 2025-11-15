# 🚀 Production Deployment Guide - E-Invoice Application

## 📋 **Overview**

This guide will help you deploy your e-invoice application to production using Docker and Portainer.

---

## 🎯 **What You'll Deploy**

Your application has 3 main components:
1. **Frontend** (Next.js) - Port 3000
2. **Backend** (Node.js/Express) - Port 8000
3. **Database** (PostgreSQL) - Port 5432

---

## 📦 **Step 1: Prepare Docker Files**

### **1.1 Frontend Dockerfile**

Create `frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
```

### **1.2 Backend Dockerfile**

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 8000

# Start the app
CMD ["npm", "run", "start"]
```

### **1.3 Docker Compose File**

Create `docker-compose.production.yml` in root directory:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: einvoice-db
    restart: always
    environment:
      POSTGRES_DB: einvoice_prod
      POSTGRES_USER: einvoice_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - einvoice-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U einvoice_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: einvoice-backend
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 8000
      DATABASE_URL: postgresql://einvoice_user:${DB_PASSWORD}@postgres:5432/einvoice_prod
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 7d
      REFRESH_TOKEN_EXPIRES_IN: 30d
      CORS_ORIGIN: ${FRONTEND_URL}
    ports:
      - "8000:8000"
    networks:
      - einvoice-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:8000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: einvoice-frontend
    restart: always
    depends_on:
      - backend
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: ${BACKEND_URL}
    ports:
      - "3000:3000"
    networks:
      - einvoice-network

  # Nginx Reverse Proxy (optional but recommended)
  nginx:
    image: nginx:alpine
    container_name: einvoice-nginx
    restart: always
    depends_on:
      - frontend
      - backend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    networks:
      - einvoice-network

volumes:
  postgres-data:
    driver: local

networks:
  einvoice-network:
    driver: bridge
```

### **1.4 Environment Variables**

Create `.env.production` in root:

```env
# Database
DB_PASSWORD=your_secure_db_password_here

# JWT Secrets
JWT_SECRET=your_jwt_secret_min_32_characters_long
REFRESH_SECRET=your_refresh_secret_min_32_characters_long

# URLs
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
```

---

## 🔧 **Step 2: Update Next.js Configuration**

Update `frontend/next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Enable standalone build for Docker
  reactStrictMode: true,
  // Add your domain for images if needed
  images: {
    domains: ['your-domain.com'],
  },
}

export default nextConfig
```

---

## 🗄️ **Step 3: Database Migration Strategy**

Create `backend/scripts/migrate.sh`:

```bash
#!/bin/bash
echo "Running database migrations..."
npx prisma migrate deploy
echo "Migrations complete!"
```

Make it executable:
```bash
chmod +x backend/scripts/migrate.sh
```

---

## 🌐 **Step 4: Nginx Configuration (Optional but Recommended)**

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:8000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # Main HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

---

## 🐳 **Step 5: Deploy with Portainer**

### **Option A: Using Portainer Stacks (Easiest)**

1. **Login to Portainer**
   - Navigate to your Portainer UI (usually port 9000)

2. **Create New Stack**
   - Go to "Stacks" → "Add stack"
   - Name: `e-invoice`

3. **Upload docker-compose.yml**
   - Copy content of `docker-compose.production.yml`
   - Paste into Portainer's web editor

4. **Add Environment Variables**
   - Click "Advanced mode"
   - Add all variables from `.env.production`

5. **Deploy Stack**
   - Click "Deploy the stack"
   - Wait for containers to start

### **Option B: Using Portainer Git Integration**

1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Production deployment ready"
   git push origin main
   ```

2. **Create Stack from Git**
   - In Portainer: "Stacks" → "Add stack"
   - Select "Git Repository"
   - Enter your GitHub repo URL
   - Compose path: `docker-compose.production.yml`
   - Add environment variables
   - Deploy

---

## 📝 **Step 6: Pre-Deployment Checklist**

Before deploying, ensure:

- [  ] `.env.production` file created with strong passwords
- [  ] `frontend/next.config.mjs` has `output: 'standalone'`
- [  ] Database password is strong (min 16 characters)
- [  ] JWT secrets are strong (min 32 characters)
- [  ] Frontend Dockerfile created
- [  ] Backend Dockerfile created
- [  ] docker-compose.production.yml created
- [  ] Backend has `start` script in package.json
- [  ] SSL certificates obtained (for HTTPS)
- [  ] Domain DNS pointed to server IP

---

## 🚀 **Step 7: Deployment Commands**

### **Manual Docker Deployment (Alternative to Portainer)**

```bash
# 1. Build and start containers
docker-compose -f docker-compose.production.yml up -d --build

# 2. Check container status
docker-compose -f docker-compose.production.yml ps

# 3. View logs
docker-compose -f docker-compose.production.yml logs -f

# 4. Run database migrations
docker exec einvoice-backend npx prisma migrate deploy

# 5. Restart containers if needed
docker-compose -f docker-compose.production.yml restart
```

---

## 🔒 **Step 8: Security Hardening**

### **Backend .env Variables**

```env
NODE_ENV=production
PORT=8000

# Database
DATABASE_URL=postgresql://einvoice_user:STRONG_PASSWORD@postgres:5432/einvoice_prod

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET=your_32_char_minimum_jwt_secret_here
REFRESH_SECRET=your_32_char_minimum_refresh_secret_here

# CORS
CORS_ORIGIN=https://your-domain.com

# Optional: Email config
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
```

### **Generate Secure Secrets**

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate DB password
openssl rand -base64 24
```

---

## 📊 **Step 9: Post-Deployment Tasks**

After deployment:

1. **Run Database Migrations**
   ```bash
   docker exec einvoice-backend npx prisma migrate deploy
   ```

2. **Create Initial Super Admin**
   ```bash
   docker exec -it einvoice-backend npx prisma studio
   # Or use SQL:
   docker exec -it einvoice-db psql -U einvoice_user -d einvoice_prod
   ```

3. **Test the Application**
   - Visit: https://your-domain.com
   - Login/Register
   - Create test invoice
   - Verify all features work

4. **Setup Monitoring (Optional)**
   - Container health checks (already included)
   - Uptime monitoring
   - Error logging

---

## 🔄 **Step 10: Updating the Application**

To deploy updates:

### **Using Portainer:**
1. Go to Stacks → Your stack
2. Click "Update"
3. Pull and redeploy

### **Using Docker Compose:**
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build

# Run new migrations if any
docker exec einvoice-backend npx prisma migrate deploy
```

---

## 🛡️ **Backup Strategy**

### **Database Backup**

Create `backup-db.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec einvoice-db pg_dump -U einvoice_user einvoice_prod > backup_$DATE.sql
echo "Backup created: backup_$DATE.sql"
```

### **Schedule Automatic Backups**

```bash
# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/backup-db.sh
```

---

## 📂 **Final File Structure**

```
e-invoice/
├── frontend/
│   ├── Dockerfile               ← CREATE THIS
│   ├── next.config.mjs          ← UPDATE THIS
│   └── ... (your frontend code)
├── backend/
│   ├── Dockerfile               ← CREATE THIS
│   ├── scripts/
│   │   └── migrate.sh          ← CREATE THIS
│   └── ... (your backend code)
├── docker-compose.production.yml ← CREATE THIS
├── .env.production              ← CREATE THIS
├── nginx.conf                   ← CREATE THIS (optional)
└── README.md
```

---

## ⚡ **Quick Start Commands**

```bash
# 1. Create production environment file
cp .env.example .env.production
# Edit .env.production with your values

# 2. Build and deploy
docker-compose -f docker-compose.production.yml up -d --build

# 3. Run migrations
docker exec einvoice-backend npx prisma migrate deploy

# 4. Check status
docker-compose -f docker-compose.production.yml ps

# 5. View logs
docker-compose -f docker-compose.production.yml logs -f
```

---

## 🌐 **DNS & Domain Setup**

### **Point Your Domain to Server**

In your DNS provider (e.g., Cloudflare, GoDaddy):

```
Type  | Name              | Value
------|-------------------|------------------
A     | your-domain.com   | YOUR_SERVER_IP
A     | api.your-domain   | YOUR_SERVER_IP
```

### **SSL Certificate (Let's Encrypt)**

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com -d api.your-domain.com

# Copy certificates to nginx folder
mkdir ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/
```

---

## 📊 **Monitoring & Maintenance**

### **Health Checks**

```bash
# Check all containers are running
docker ps

# Check backend health
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000

# Check database
docker exec einvoice-db pg_isready -U einvoice_user
```

### **View Logs**

```bash
# All containers
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f frontend
docker-compose -f docker-compose.production.yml logs -f postgres
```

---

## 🐛 **Troubleshooting**

### **Container Won't Start**

```bash
# Check logs
docker logs einvoice-backend
docker logs einvoice-frontend

# Check environment variables
docker exec einvoice-backend env

# Restart specific container
docker restart einvoice-backend
```

### **Database Connection Issues**

```bash
# Check database is running
docker ps | grep postgres

# Test connection
docker exec einvoice-backend npx prisma db push --preview-feature
```

### **Migration Issues**

```bash
# Reset and re-run migrations
docker exec einvoice-backend npx prisma migrate reset
docker exec einvoice-backend npx prisma migrate deploy
```

---

## 💾 **Backup & Restore**

### **Backup Database**

```bash
# Create backup
docker exec einvoice-db pg_dump -U einvoice_user einvoice_prod > backup.sql

# Compress backup
gzip backup.sql
```

### **Restore Database**

```bash
# Restore from backup
gunzip backup.sql.gz
docker exec -i einvoice-db psql -U einvoice_user einvoice_prod < backup.sql
```

---

## 🔐 **Security Best Practices**

1. ✅ Use strong, unique passwords
2. ✅ Enable SSL/HTTPS
3. ✅ Keep secrets in environment variables (never in code)
4. ✅ Regular backups (automated daily)
5. ✅ Update dependencies regularly
6. ✅ Monitor logs for suspicious activity
7. ✅ Use firewall (only open ports 80, 443)
8. ✅ Keep Docker and images updated

---

## 📈 **Performance Optimization**

### **For Production**

```bash
# Set Node memory limit
NODE_OPTIONS="--max-old-space-size=2048"

# Enable production mode
NODE_ENV=production

# Use process manager (PM2) in backend
npm install -g pm2
pm2 start npm --name "einvoice-backend" -- start
```

---

## 🎯 **Final Checklist**

Before going live:

- [  ] All Docker files created
- [  ] Environment variables set (strong passwords)
- [  ] Database migrations run successfully
- [  ] SSL certificates installed
- [  ] Domain DNS configured
- [  ] Tested login/register
- [  ] Tested invoice creation
- [  ] Tested payment recording
- [  ] Tested all features
- [  ] Backup strategy in place
- [  ] Monitoring setup

---

## 🆘 **Need Help?**

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Port already in use | Stop conflicting service or change port |
| Database connection failed | Check DATABASE_URL and postgres container status |
| 502 Bad Gateway | Backend not running, check logs |
| CORS errors | Update CORS_ORIGIN in backend .env |
| Can't login | Check JWT_SECRET is set correctly |

---

**Your application is ready for production deployment!** 🚀

**Would you like me to create these Docker files for you?**

