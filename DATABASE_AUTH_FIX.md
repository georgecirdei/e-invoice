# 🔧 Database Authentication Fix

## ❌ **Error**

```
P1000: Authentication failed against database server at `postgres`, 
the provided database credentials for `einvoice_user` are not valid.
```

---

## 🔍 **Cause**

The database password in the Docker container doesn't match the password used to create the PostgreSQL database.

---

## ✅ **Solution: Recreate Database with Correct Password**

### **Step 1: Stop All Containers**

```bash
docker compose -f ~/apps/e-invoice/docker-compose.production.yml down
```

### **Step 2: Remove Old Database Volume**

```bash
# Remove the volume with wrong password
docker volume rm e-invoice_postgres-data

# Or if that fails:
docker volume ls  # Find the exact volume name
docker volume rm <volume-name>
```

### **Step 3: Verify .env.production**

```bash
# Switch to einvoice user
su - einvoice
cd ~/apps/e-invoice

# Check your .env.production file
cat .env.production
```

Make sure it has:
```env
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=https://invoizz.com
BACKEND_URL=https://invoizz.com
```

### **Step 4: Start Fresh**

```bash
# Start containers with clean database
docker compose -f docker-compose.production.yml up -d

# Wait for database to initialize (30 seconds)
sleep 30

# Check containers are running
docker ps
```

### **Step 5: Run Migrations**

```bash
# Now migrations should work!
docker exec einvoice-backend npx prisma migrate deploy

# Should create all tables successfully
```

### **Step 6: Verify Database**

```bash
# List tables
docker exec einvoice-db psql -U einvoice_user -d einvoice_prod -c "\dt"

# You should see:
# User, Organization, Invoice, Customer, Payment, Notification, etc.
```

---

## 🎯 **Alternative: Use docker-compose.yml Environment Variables**

If you prefer, you can pass the password directly:

```bash
# Export the password first
export DB_PASSWORD="your_secure_password"

# Then start containers
docker compose -f docker-compose.production.yml up -d
```

---

## 📝 **Quick Commands**

```bash
# Full reset and restart:
docker compose -f ~/apps/e-invoice/docker-compose.production.yml down -v
docker compose -f ~/apps/e-invoice/docker-compose.production.yml up -d
sleep 30
docker exec einvoice-backend npx prisma migrate deploy
```

---

## ✅ **After Fix**

You should see:
- ✅ All containers running
- ✅ No restart loops
- ✅ Migrations applied successfully
- ✅ Application accessible at https://invoizz.com

---

**Run the commands above to recreate the database with the correct password!**

