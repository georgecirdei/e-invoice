# 🏠 Synology NAS Deployment Guide - E-Invoice Application

## 📋 **Overview**

This guide will help you deploy your e-invoice application to Synology NAS using Container Manager (Docker).

---

## 🎯 **Prerequisites**

### **On Your Synology NAS:**
- ✅ DSM 7.0 or higher installed
- ✅ Container Manager package installed
- ✅ At least 4GB RAM available
- ✅ At least 10GB storage available
- ✅ SSH access enabled (optional but recommended)

### **Before You Start:**
- Your GitHub repository: https://github.com/georgecirdei/e-invoice
- Synology NAS IP address
- Admin credentials for Synology DSM

---

## 📦 **Step 1: Install Container Manager**

1. **Open Package Center**
   - Login to Synology DSM
   - Go to **Package Center**

2. **Search for Container Manager**
   - Search: "Container Manager"
   - Click **Install**
   - Wait for installation to complete

3. **Open Container Manager**
   - Go to **Main Menu** → **Container Manager**

---

## 📂 **Step 2: Prepare Project Files on Synology**

### **Option A: Using File Station (GUI)**

1. **Open File Station**
   - Go to **Main Menu** → **File Station**

2. **Create Project Folder**
   - Navigate to: `/docker/`
   - Create folder: `e-invoice`
   - Inside `e-invoice`, create:
     - `frontend/`
     - `backend/`

3. **Upload Files**
   - Upload your project files from GitHub
   - Or use **Git** (see Option B)

### **Option B: Using SSH + Git (Recommended)**

1. **Enable SSH**
   - DSM → **Control Panel** → **Terminal & SNMP**
   - Enable **SSH service** (port 22)

2. **Connect via SSH**
   ```bash
   ssh your-admin@synology-ip
   ```

3. **Navigate to Docker folder**
   ```bash
   cd /volume1/docker
   # or wherever your docker folder is
   ```

4. **Clone Your Repository**
   ```bash
   git clone https://github.com/georgecirdei/e-invoice.git
   cd e-invoice
   ```

5. **Create Environment File**
   ```bash
   nano .env.production
   ```

   Add:
   ```env
   DB_PASSWORD=your_secure_db_password
   JWT_SECRET=your_jwt_secret_min_32_chars
   REFRESH_SECRET=your_refresh_secret_min_32_chars
   FRONTEND_URL=http://synology-ip:3000
   BACKEND_URL=http://synology-ip:8000
   ```

   Save with: `Ctrl+X`, then `Y`, then `Enter`

---

## 🐳 **Step 3: Deploy Using Container Manager**

### **Method 1: Using Container Manager GUI (Easiest)**

1. **Open Container Manager**
   - Go to **Container Manager** in DSM

2. **Go to Project Tab**
   - Click on **Project** in left sidebar
   - Click **Create**

3. **Configure Project**
   - **Project Name**: `e-invoice`
   - **Path**: Select `/docker/e-invoice` (or your path)
   - **Source**: `docker-compose.production.yml`

4. **Set Environment Variables**
   - Click **Environment** tab
   - Add variables:
     ```
     DB_PASSWORD=your_password
     JWT_SECRET=your_secret
     REFRESH_SECRET=your_secret
     FRONTEND_URL=http://YOUR_SYNOLOGY_IP:3000
     BACKEND_URL=http://YOUR_SYNOLOGY_IP:8000
     ```

5. **Click Next** → **Done**
   - Container Manager will build and start containers
   - Wait 5-10 minutes for first build

6. **Check Container Status**
   - Go to **Container** tab
   - You should see 3 containers:
     - `einvoice-db` (PostgreSQL)
     - `einvoice-backend` (API)
     - `einvoice-frontend` (Web UI)
   - All should show status: **Running**

---

### **Method 2: Using Terminal (Advanced)**

If you prefer command line:

```bash
# SSH into Synology
ssh admin@synology-ip

# Navigate to project
cd /volume1/docker/e-invoice

# Build and start containers
docker-compose -f docker-compose.production.yml up -d --build

# Check status
docker ps

# View logs
docker logs einvoice-backend
docker logs einvoice-frontend
docker logs einvoice-db
```

---

## 🗄️ **Step 4: Run Database Migrations**

After containers are running, you need to create the database tables:

### **Using Container Manager GUI:**

1. **Go to Container tab**
2. **Click on `einvoice-backend`**
3. **Click "Details"** → **Terminal** tab
4. **Click "Create"** → Select `/bin/sh`
5. **Run migration command:**
   ```bash
   npx prisma migrate deploy
   ```
6. **Wait for migrations** to complete
7. **Close terminal**

### **Using SSH:**

```bash
# Run migrations
docker exec einvoice-backend npx prisma migrate deploy

# Verify tables created
docker exec einvoice-db psql -U einvoice_user -d einvoice_prod -c "\dt"
```

---

## 🌐 **Step 5: Access Your Application**

### **Find Your Synology IP**
- DSM → **Control Panel** → **Network** → **Network Interface**
- Note the IP address (e.g., 192.168.1.100)

### **Access URLs**

- **Frontend**: `http://YOUR_SYNOLOGY_IP:3000`
- **Backend API**: `http://YOUR_SYNOLOGY_IP:8000/health`
- **Container Manager**: DSM → **Container Manager**

### **First Time Setup**

1. **Visit**: `http://YOUR_SYNOLOGY_IP:3000`
2. **Click**: "Sign up" or "Register"
3. **Create** your first account
4. **Login** with credentials
5. **Setup** your organization
6. **Start** creating invoices!

---

## 🔒 **Step 6: Configure Port Forwarding (Optional)**

To access from outside your network:

1. **Synology Router Setup**
   - Go to **Control Panel** → **External Access** → **Router Configuration**
   - Or access your router directly

2. **Add Port Forwarding Rules**
   ```
   External Port | Internal Port | Internal IP
   -------------|---------------|----------------
   80           | 3000          | SYNOLOGY_IP
   8080         | 8000          | SYNOLOGY_IP
   ```

3. **Access from Internet**
   - Frontend: `http://your-public-ip:80`
   - Backend: `http://your-public-ip:8080`

---

## 🔐 **Step 7: Setup Reverse Proxy (Recommended)**

For better URLs without port numbers:

1. **Open Application Portal**
   - DSM → **Control Panel** → **Login Portal** → **Advanced** tab
   - Click **Reverse Proxy**

2. **Create Frontend Rule**
   - Click **Create**
   - **Description**: E-Invoice Frontend
   - **Source**:
     - Protocol: HTTP
     - Hostname: your-domain.com (or synology IP)
     - Port: 80
   - **Destination**:
     - Protocol: HTTP
     - Hostname: localhost
     - Port: 3000
   - Click **Save**

3. **Create Backend Rule**
   - Click **Create**
   - **Description**: E-Invoice API
   - **Source**:
     - Protocol: HTTP
     - Hostname: api.your-domain.com
     - Port: 80
   - **Destination**:
     - Protocol: HTTP
     - Hostname: localhost
     - Port: 8000
   - Click **Save**

Now you can access:
- Frontend: `http://synology-ip/` (no port needed!)
- Backend: `http://synology-ip/api/`

---

## 📊 **Step 8: Container Management**

### **Start/Stop Containers**

Using Container Manager GUI:
1. Go to **Container** tab
2. Select container(s)
3. Click **Action** → **Start/Stop/Restart**

Using SSH:
```bash
# Stop all
docker-compose -f docker-compose.production.yml stop

# Start all
docker-compose -f docker-compose.production.yml start

# Restart specific container
docker restart einvoice-backend
```

### **View Container Logs**

1. **Container Manager** → **Container** tab
2. Click on container name
3. Click **Logs** tab
4. View real-time logs

---

## 💾 **Step 9: Backup Strategy**

### **Automatic Database Backup**

1. **Create Backup Script**
   
   Using File Station, create file: `/docker/e-invoice/backup.sh`
   
   ```bash
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/volume1/docker/e-invoice/backups"
   
   # Create backup directory if not exists
   mkdir -p $BACKUP_DIR
   
   # Backup database
   docker exec einvoice-db pg_dump -U einvoice_user einvoice_prod > $BACKUP_DIR/backup_$DATE.sql
   
   # Compress backup
   gzip $BACKUP_DIR/backup_$DATE.sql
   
   # Keep only last 7 backups
   cd $BACKUP_DIR
   ls -t backup_*.sql.gz | tail -n +8 | xargs -r rm
   
   echo "Backup completed: backup_$DATE.sql.gz"
   ```

2. **Make Script Executable**
   ```bash
   chmod +x /volume1/docker/e-invoice/backup.sh
   ```

3. **Schedule with Task Scheduler**
   - DSM → **Control Panel** → **Task Scheduler**
   - Create → **Scheduled Task** → **User-defined script**
   - **General**:
     - Task name: E-Invoice DB Backup
     - User: root
   - **Schedule**:
     - Run on: Daily
     - Time: 2:00 AM
   - **Task Settings**:
     - Run command: `/volume1/docker/e-invoice/backup.sh`
   - Click **OK**

### **Restore from Backup**

```bash
# List backups
ls -lh /volume1/docker/e-invoice/backups/

# Restore
gunzip /volume1/docker/e-invoice/backups/backup_YYYYMMDD_HHMMSS.sql.gz
docker exec -i einvoice-db psql -U einvoice_user einvoice_prod < /volume1/docker/e-invoice/backups/backup_YYYYMMDD_HHMMSS.sql
```

---

## 🔄 **Step 10: Update Your Application**

When you push updates to GitHub:

### **Update via Container Manager:**

1. **SSH to Synology**
   ```bash
   ssh admin@synology-ip
   cd /volume1/docker/e-invoice
   ```

2. **Pull Latest Code**
   ```bash
   git pull origin main
   ```

3. **Rebuild Containers**
   ```bash
   docker-compose -f docker-compose.production.yml up -d --build
   ```

4. **Run New Migrations** (if any)
   ```bash
   docker exec einvoice-backend npx prisma migrate deploy
   ```

5. **Verify Update**
   - Check Container Manager → All containers running
   - Visit your app and test

---

## 📈 **Step 11: Monitoring & Maintenance**

### **Resource Monitoring**

1. **Container Manager** → **Container** tab
   - See CPU and RAM usage for each container
   - Click container for detailed metrics

2. **Resource Monitor**
   - DSM → **Resource Monitor**
   - Check overall system health

### **Health Checks**

The containers have built-in health checks:
- **Database**: Checks every 10 seconds
- **Backend**: Checks every 30 seconds
- Unhealthy containers auto-restart

### **View Logs**

Container Manager → Container → Select container → **Logs** tab

Or via SSH:
```bash
# Real-time logs
docker logs -f einvoice-backend

# Last 100 lines
docker logs --tail 100 einvoice-frontend

# Search logs
docker logs einvoice-backend | grep ERROR
```

---

## 🛡️ **Step 12: Security Configuration**

### **Firewall Rules**

1. **Control Panel** → **Security** → **Firewall**
2. **Create Rule**:
   - Ports to allow:
     - 3000 (Frontend)
     - 8000 (Backend)
     - Or 80/443 if using reverse proxy
   - Source IP: Allow specific IPs or your network range

### **SSL Certificate (HTTPS)**

1. **Get SSL Certificate**
   - **Control Panel** → **Security** → **Certificate**
   - Click **Add** → **Add a new certificate**
   - Use Let's Encrypt (free) or import your own

2. **Assign to Services**
   - Click **Configure**
   - Assign certificate to your domain

3. **Update Application URLs**
   - Change `http://` to `https://` in your environment variables
   - Update CORS settings

---

## 🔧 **Troubleshooting**

### **Containers Won't Start**

1. **Check Container Logs**
   - Container Manager → Container → Logs tab
   - Look for error messages

2. **Common Issues**:
   - **Port conflict**: Change ports in docker-compose.yml
   - **Memory**: Increase Docker memory limit
   - **Permission**: Run as root user

### **Can't Access Application**

1. **Check Containers Running**
   - All 3 containers should show "Running" status

2. **Check Firewall**
   - Control Panel → Security → Firewall
   - Allow ports 3000 and 8000

3. **Check Network**
   - Ping Synology IP from your computer
   - Try accessing DSM (port 5000/5001)

### **Database Connection Errors**

```bash
# SSH into Synology
ssh admin@synology-ip

# Check database
docker exec einvoice-db pg_isready -U einvoice_user

# Check connection from backend
docker exec einvoice-backend npx prisma db push --preview-feature
```

---

## 📊 **Resource Requirements**

### **Minimum Requirements:**
- **RAM**: 4GB (2GB for containers, 2GB for DSM)
- **Storage**: 10GB (app + database)
- **CPU**: Dual-core processor

### **Recommended:**
- **RAM**: 8GB or more
- **Storage**: 20GB+ (for growth and backups)
- **CPU**: Quad-core processor

### **Per Container:**
```
postgres:  ~200MB RAM, ~1GB storage
backend:   ~300MB RAM, ~500MB storage
frontend:  ~150MB RAM, ~200MB storage
```

---

## 🌐 **Step 13: Access from Internet**

### **Option A: QuickConnect (Easiest)**

1. **Setup QuickConnect**
   - Control Panel → **QuickConnect**
   - Register QuickConnect ID

2. **Access**
   - `http://quickconnect.to/YOUR_ID:3000`

### **Option B: DDNS (Dynamic DNS)**

1. **Setup DDNS**
   - Control Panel → **External Access** → **DDNS**
   - Add service (e.g., Synology DDNS)
   - Choose hostname: `your-name.synology.me`

2. **Configure Router Port Forwarding**
   - Forward ports 80, 443 to Synology IP

3. **Access**
   - `http://your-name.synology.me`

---

## 🔄 **Complete Deployment Steps**

### **Quick Reference:**

```bash
# 1. SSH to Synology
ssh admin@synology-ip

# 2. Navigate to docker folder
cd /volume1/docker

# 3. Clone repository
git clone https://github.com/georgecirdei/e-invoice.git
cd e-invoice

# 4. Create environment file
nano .env.production
# (Add your environment variables)

# 5. Create Container Manager project
# (Use GUI as described in Step 3)

# 6. Wait for build (5-10 minutes)

# 7. Run migrations
docker exec einvoice-backend npx prisma migrate deploy

# 8. Access application
# http://SYNOLOGY_IP:3000
```

---

## 📱 **Mobile Access**

### **Synology DS Apps**

1. **Install DS File** (mobile app)
   - Manage files and backups

2. **Install DS Cloud** (optional)
   - Sync files to mobile

3. **Bookmark Web App**
   - Add `http://synology-ip:3000` to home screen
   - Works like native app

---

## 💡 **Pro Tips for Synology**

### **1. Use Docker Folder**
Always deploy to `/volume1/docker/` for best performance

### **2. Enable Auto-Start**
Container Manager → Container → Select all → **Edit** → Enable auto-restart

### **3. Monitor Resource Usage**
Resource Monitor → Process → Docker

### **4. Scheduled Maintenance**
Task Scheduler → Create tasks for:
- Daily database backup
- Weekly container restart
- Monthly Docker image cleanup

### **5. Notification Setup**
Control Panel → Notification → Email:
- Get notified when containers stop
- Disk space warnings
- Security alerts

---

## 📋 **Synology-Specific Commands**

```bash
# Synology Docker commands
sudo docker ps                          # List containers
sudo docker-compose version             # Check version
sudo docker system df                   # Check disk usage
sudo docker system prune -a             # Clean up (careful!)

# Synology paths
/volume1/docker/                        # Docker projects
/var/packages/ContainerManager/         # Container Manager
/volume1/@docker/                       # Docker data
```

---

## 🆘 **Common Synology Issues**

### **Issue: Out of Memory**

**Solution:**
1. Control Panel → Info Center → check RAM
2. Stop unnecessary packages
3. Increase Docker memory limit
4. Consider upgrading RAM

### **Issue: Storage Full**

**Solution:**
```bash
# Check disk usage
df -h

# Clean Docker
sudo docker system prune -a

# Move Docker to larger volume
# (requires advanced setup)
```

### **Issue: Can't Build Images**

**Solution:**
1. Check internet connection
2. Check DNS settings
3. Try pulling images separately:
   ```bash
   docker pull node:18-alpine
   docker pull postgres:15-alpine
   ```

---

## 📦 **Step 14: Backup Entire Container**

### **Export Container Configuration**

1. **Container Manager** → **Project** tab
2. **Select** `e-invoice` project
3. **Export** settings to file
4. **Save** to secure location

### **Backup Volumes**

1. **Hyper Backup** (Synology package)
2. **Add Task**:
   - Data type: Local folder
   - Select: `/volume1/docker/e-invoice`
   - Schedule: Daily
   - Retention: 7 versions

---

## 🎯 **Final Checklist**

Before going live on Synology:

- [  ] Container Manager installed
- [  ] Project cloned to `/volume1/docker/e-invoice`
- [  ] `.env.production` file created with strong passwords
- [  ] Project created in Container Manager
- [  ] All 3 containers running
- [  ] Database migrations completed
- [  ] Can access frontend (port 3000)
- [  ] Can login/register
- [  ] Backup script created and scheduled
- [  ] Firewall configured (if needed)
- [  ] Reverse proxy setup (optional)
- [  ] Auto-restart enabled on all containers

---

## 📖 **Additional Synology Resources**

- **Synology Community**: https://community.synology.com/
- **Docker on Synology**: https://www.synology.com/en-global/dsm/packages/ContainerManager
- **DSM Knowledge Base**: https://kb.synology.com/

---

## 🎉 **Success!**

After completing these steps:

✅ Your e-invoice application is running on Synology NAS  
✅ Accessible from your local network  
✅ Database backed up automatically  
✅ Containers auto-restart on failure  
✅ Production-ready and secure  

---

## 🆘 **Need Help?**

**Check these first:**
1. Container Manager → Container → Logs
2. Resource Monitor → CPU/RAM usage
3. Storage Manager → Volume → Available space
4. Control Panel → Log Center → System logs

**Common URLs:**
- DSM: `http://synology-ip:5000`
- Application: `http://synology-ip:3000`
- Container Manager: DSM → Container Manager

---

**Your e-invoice application is now deployed on Synology NAS!** 🏠✨

**Access it at**: `http://YOUR_SYNOLOGY_IP:3000` 🎉

