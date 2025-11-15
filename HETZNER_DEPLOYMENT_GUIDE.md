# 🚀 Hetzner Cloud Deployment Guide - E-Invoice Application

## 📋 **Complete Step-by-Step Deployment to Hetzner CX32**

This guide covers **EVERY STEP** to deploy your e-invoice application to Hetzner Cloud CX32 (Ubuntu 22.04).

---

## 🖥️ **Your Server Specs**

- **Server**: Hetzner CX32
- **OS**: Ubuntu 22.04 LTS
- **RAM**: 8GB
- **CPU**: 4 vCPUs
- **Storage**: 80GB NVMe SSD
- **Network**: 20TB traffic

**Perfect for your e-invoice application!** ✅

---

## 🔐 **Step 1: Initial Server Access**

### **1.1 Get Your Server IP**

1. Login to **Hetzner Cloud Console**: https://console.hetzner.cloud/
2. Go to **Projects** → Your project
3. Click on your **CX32 server**
4. Note the **IPv4 address** (e.g., 95.217.xxx.xxx)

### **1.2 SSH into Server**

```bash
# From your local machine (Windows PowerShell or Terminal)
ssh root@YOUR_SERVER_IP

# First time: Type 'yes' to accept fingerprint
# Enter your root password
```

**You should now see:**
```
root@ubuntu-cx32:~#
```

---

## 🛡️ **Step 2: Secure Your Server**

### **2.1 Update System**

```bash
# Update package list
apt update

# Upgrade all packages
apt upgrade -y

# Reboot if kernel updated
# reboot
```

### **2.2 Create Non-Root User**

```bash
# Create user
adduser einvoice

# Make strong password when prompted
# Fill in user info (optional, can skip)

# Add to sudo group
usermod -aG sudo einvoice

# Add to docker group (we'll create this later)
usermod -aG docker einvoice
```

### **2.3 Setup SSH Key Authentication (Recommended)**

**On your local machine:**
```powershell
# Generate SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy public key to server
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh einvoice@YOUR_SERVER_IP "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**On the server:**
```bash
# Set proper permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### **2.4 Configure Firewall**

```bash
# Install UFW firewall
apt install ufw -y

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (IMPORTANT!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow backend API (temporary, will use nginx later)
ufw allow 8000/tcp

# Enable firewall
ufw enable

# Check status
ufw status verbose
```

**You should see:**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
8000/tcp                   ALLOW       Anywhere
```

---

## 🐳 **Step 3: Install Docker**

### **3.1 Install Docker**

```bash
# Remove old versions (if any)
apt remove docker docker-engine docker.io containerd runc

# Install dependencies
apt update
apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

**You should see:**
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

### **3.2 Enable Docker Service**

```bash
# Start Docker
systemctl start docker

# Enable on boot
systemctl enable docker

# Verify Docker is running
systemctl status docker
```

### **3.3 Add User to Docker Group**

```bash
# Add einvoice user to docker group
usermod -aG docker einvoice

# Switch to einvoice user
su - einvoice

# Verify docker access (should work without sudo)
docker ps
```

---

## 📦 **Step 4: Install Additional Tools**

```bash
# Switch back to root
exit

# Install essential tools
apt install -y \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    htop \
    curl \
    wget \
    nano \
    unzip

# Verify installations
git --version
nginx -v
certbot --version
```

---

## 📁 **Step 5: Clone Your Application**

### **5.1 Create Application Directory**

```bash
# Switch to einvoice user
su - einvoice

# Create directory
mkdir -p ~/apps
cd ~/apps

# Clone repository
git clone https://github.com/georgecirdei/e-invoice.git
cd e-invoice

# Verify files
ls -la
```

**You should see:**
```
backend/
frontend/
docker-compose.production.yml
SYNOLOGY_DEPLOYMENT_GUIDE.md
... (other files)
```

---

## ⚙️ **Step 6: Configure Environment Variables**

### **6.1 Generate Secrets**

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate refresh secret
openssl rand -base64 32

# Generate DB password
openssl rand -base64 24

# Copy these values - you'll need them next!
```

### **6.2 Create Production Environment File**

```bash
# Create .env.production file
nano .env.production
```

**Paste this content** (replace placeholders with your generated values):

```env
# Database Configuration
DB_PASSWORD=paste_generated_db_password_here

# JWT Secrets (from openssl commands above)
JWT_SECRET=paste_generated_jwt_secret_here
REFRESH_SECRET=paste_generated_refresh_secret_here

# Application URLs (update after domain setup)
FRONTEND_URL=http://YOUR_SERVER_IP:3000
BACKEND_URL=http://YOUR_SERVER_IP:8000

# Email Configuration (optional, for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Node Environment
NODE_ENV=production
```

**Save and exit**: Press `Ctrl+X`, then `Y`, then `Enter`

### **6.3 Verify Environment File**

```bash
# Check file created
cat .env.production

# Ensure no trailing spaces or empty lines
```

---

## 🏗️ **Step 7: Build and Deploy Containers**

### **7.1 Build Docker Images**

```bash
# Make sure you're in the e-invoice directory
cd ~/apps/e-invoice

# Load environment variables (ignoring comments)
export $(grep -v '^#' .env.production | xargs)

# Build containers (this takes 5-10 minutes)
docker compose -f docker-compose.production.yml build

# You'll see:
# [+] Building frontend...
# [+] Building backend...
```

### **7.2 Start Containers**

```bash
# Start all containers
docker compose -f docker-compose.production.yml up -d

# Check containers are running
docker ps

# You should see 3 containers:
# einvoice-db (postgres)
# einvoice-backend (node)
# einvoice-frontend (node)
```

**Verify all containers show STATUS = "Up"**

### **7.3 View Logs (Check for Errors)**

```bash
# View all logs
docker compose -f docker-compose.production.yml logs -f

# Press Ctrl+C to stop viewing logs

# Check specific container
docker logs einvoice-backend
docker logs einvoice-frontend
docker logs einvoice-db
```

**Look for:**
- ✅ "Server running on port 8000" (backend)
- ✅ "Ready on http://0.0.0.0:3000" (frontend)
- ✅ No error messages

---

## 🗄️ **Step 8: Initialize Database**

### **8.1 Run Prisma Migrations**

```bash
# Run migrations to create all tables
docker exec einvoice-backend npx prisma migrate deploy

# You should see:
# ✓ Migration applied successfully
```

### **8.2 Verify Database**

```bash
# Check tables were created
docker exec einvoice-db psql -U einvoice_user -d einvoice_prod -c "\dt"

# You should see list of tables:
# User, Organization, Invoice, Customer, Payment, Notification, etc.
```

### **8.3 Create Initial Super Admin (Optional)**

```bash
# Open Prisma Studio
docker exec -it einvoice-backend npx prisma studio

# Access at: http://YOUR_SERVER_IP:5555
# Create your first user manually
# Or wait and register via the frontend
```

---

## 🌐 **Step 9: Configure Nginx Reverse Proxy**

### **9.1 Create Nginx Configuration**

```bash
# Switch to root
exit  # Exit from einvoice user to root

# Create nginx site configuration
nano /etc/nginx/sites-available/einvoice
```

**Paste this configuration:**

```nginx
# HTTP - Redirect to HTTPS (we'll add SSL later)
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:8000/health;
    }
}
```

**Save**: `Ctrl+X`, `Y`, `Enter`

### **9.2 Enable Site**

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/einvoice /etc/nginx/sites-enabled/

# Remove default site (optional)
rm /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Should show: "syntax is ok" and "test is successful"

# Restart nginx
systemctl restart nginx

# Enable nginx on boot
systemctl enable nginx

# Check nginx status
systemctl status nginx
```

---

## 🔒 **Step 10: Setup SSL Certificate (HTTPS)**

### **10.1 Point Your Domain to Server** (If you have a domain)

**In your domain registrar (e.g., Cloudflare, GoDaddy, Namecheap):**

```
Type  | Name              | Value (Server IP)
------|-------------------|-------------------
A     | @                 | YOUR_SERVER_IP
A     | www               | YOUR_SERVER_IP
A     | api               | YOUR_SERVER_IP
```

**Wait 5-10 minutes for DNS propagation**

### **10.2 Get SSL Certificate with Let's Encrypt**

```bash
# Get certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms (Y)
# - Share email? (N)
# - Redirect HTTP to HTTPS? (2 - Yes, redirect)

# Certificate will be automatically installed!
```

### **10.3 Update Application URLs**

```bash
# Switch to einvoice user
su - einvoice
cd ~/apps/e-invoice

# Edit environment file
nano .env.production
```

**Update URLs:**
```env
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com
```

**Save and restart containers:**
```bash
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d
```

### **10.4 Setup Auto-Renewal**

```bash
# Certbot auto-renewal is already configured!
# Test renewal
sudo certbot renew --dry-run

# Should show: "Congratulations, all simulated renewals succeeded"
```

---

## 🧪 **Step 11: Test Your Deployment**

### **11.1 Check All Services**

```bash
# Check containers
docker ps

# All 3 should be "Up"

# Check nginx
sudo systemctl status nginx

# Should be "active (running)"

# Check firewall
sudo ufw status

# Ports 22, 80, 443 should be allowed
```

### **11.2 Test Frontend**

**Open browser:**
- Without domain: `http://YOUR_SERVER_IP`
- With domain: `https://yourdomain.com`

**You should see**: E-Invoice login page ✅

### **11.3 Test Backend**

**Open browser:**
- `http://YOUR_SERVER_IP/health`
- Or: `https://yourdomain.com/health`

**You should see**: `{"status":"ok","timestamp":"..."}`

### **11.4 Test Complete Flow**

1. **Register** a new user
2. **Login** with credentials
3. **Setup organization**
4. **Create a customer**
5. **Create an invoice**
6. **Verify** all features work

---

## 📊 **Step 12: Monitoring Setup**

### **12.1 Install Monitoring Tools**

```bash
# Switch to root
exit

# Install htop for process monitoring
apt install -y htop

# Install netdata for comprehensive monitoring (optional)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Access Netdata at: http://YOUR_SERVER_IP:19999
```

### **12.2 Setup Log Rotation**

```bash
# Create logrotate config
nano /etc/logrotate.d/docker-containers
```

**Add:**
```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=10M
    missingok
    delaycompress
    copytruncate
}
```

### **12.3 Monitor Container Health**

```bash
# Check container stats
docker stats

# Check disk usage
docker system df

# Check logs
docker compose -f ~/apps/e-invoice/docker-compose.production.yml logs -f --tail=50
```

---

## 💾 **Step 13: Setup Automated Backups**

### **13.1 Create Backup Script**

```bash
# Create backup directory
mkdir -p /home/einvoice/backups

# Create backup script
nano /home/einvoice/backup-einvoice.sh
```

**Add:**
```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/home/einvoice/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup database
echo "Starting database backup..."
docker exec einvoice-db pg_dump -U einvoice_user einvoice_prod > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Backup environment and config files
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz -C /home/einvoice/apps/e-invoice .env.production docker-compose.production.yml

# Delete old backups (keep last 7 days)
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "config_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_DIR/db_backup_$DATE.sql.gz"
echo "Total backups: $(ls -l $BACKUP_DIR/*.gz | wc -l)"
```

**Make executable:**
```bash
chmod +x /home/einvoice/backup-einvoice.sh

# Test backup
/home/einvoice/backup-einvoice.sh

# Check backup created
ls -lh /home/einvoice/backups/
```

### **13.2 Schedule Daily Backups**

```bash
# Edit crontab
crontab -e

# Select nano (option 1)

# Add this line (runs daily at 2 AM)
0 2 * * * /home/einvoice/backup-einvoice.sh >> /var/log/einvoice-backup.log 2>&1

# Save and exit (Ctrl+X, Y, Enter)

# Verify crontab
crontab -l
```

### **13.3 Backup to External Storage (Optional)**

```bash
# Install rclone for cloud backup
curl https://rclone.org/install.sh | sudo bash

# Configure rclone for Google Drive, Dropbox, etc.
rclone config

# Add to backup script to sync to cloud
rclone sync /home/einvoice/backups/ remote:einvoice-backups/
```

---

## 🔄 **Step 14: Setup Auto-Updates**

### **14.1 Create Update Script**

```bash
# Create update script
nano /home/einvoice/update-einvoice.sh
```

**Add:**
```bash
#!/bin/bash

echo "🔄 Updating E-Invoice Application..."

# Navigate to project
cd /home/einvoice/apps/e-invoice

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Rebuild containers
echo "🐳 Rebuilding containers..."
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build

# Run migrations
echo "🗄️  Running database migrations..."
docker exec einvoice-backend npx prisma migrate deploy

# Check status
echo "✅ Checking container status..."
docker ps

echo "✨ Update complete!"
```

**Make executable:**
```bash
chmod +x /home/einvoice/update-einvoice.sh
```

### **14.2 Run Updates**

```bash
# Whenever you want to update
/home/einvoice/update-einvoice.sh
```

---

## 📈 **Step 15: Performance Optimization**

### **15.1 Optimize Docker**

```bash
# Edit Docker daemon config
sudo nano /etc/docker/daemon.json
```

**Add:**
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
```

**Restart Docker:**
```bash
sudo systemctl restart docker
```

### **15.2 Increase File Limits**

```bash
# Edit limits
sudo nano /etc/security/limits.conf
```

**Add:**
```
*    soft    nofile  65536
*    hard    nofile  65536
```

### **15.3 Enable Swap (If Needed)**

```bash
# Check current swap
free -h

# Create 2GB swap file (if needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 🔒 **Step 16: Security Hardening**

### **16.1 Disable Root SSH Login**

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config
```

**Change these lines:**
```
PermitRootLogin no
PasswordAuthentication no  # Force SSH key only
```

**Restart SSH:**
```bash
sudo systemctl restart sshd
```

### **16.2 Install Fail2Ban**

```bash
# Install fail2ban
sudo apt install fail2ban -y

# Start and enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

### **16.3 Configure Automatic Security Updates**

```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades -y

# Enable automatic security updates
sudo dpkg-reconfigure --priority=low unattended-upgrades

# Select: Yes
```

---

## 🎯 **Step 17: Domain Configuration (Optional)**

### **17.1 If You Have a Domain**

1. **Point DNS to server IP** (in your registrar)
2. **Update Nginx config** with your domain
3. **Get SSL certificate** with certbot (Step 10)
4. **Update .env.production** with domain URLs

### **17.2 If Using IP Address Only**

Your app will be accessible at:
- Frontend: `http://YOUR_SERVER_IP`
- Backend: `http://YOUR_SERVER_IP/api/`

---

## 🧰 **Step 18: Useful Management Commands**

### **Container Management**

```bash
# Start application
cd ~/apps/e-invoice
docker compose -f docker-compose.production.yml up -d

# Stop application
docker compose -f docker-compose.production.yml down

# Restart application
docker compose -f docker-compose.production.yml restart

# View logs (real-time)
docker compose -f docker-compose.production.yml logs -f

# View specific container logs
docker logs einvoice-backend -f

# Check container health
docker inspect einvoice-backend | grep -A 10 Health

# Remove and rebuild everything
docker compose -f docker-compose.production.yml down -v
docker compose -f docker-compose.production.yml up -d --build
```

### **Database Management**

```bash
# Access PostgreSQL
docker exec -it einvoice-db psql -U einvoice_user -d einvoice_prod

# Common SQL commands:
# \dt           - List tables
# \d+ User      - Describe User table
# SELECT COUNT(*) FROM "User";  - Count users
# \q            - Exit

# Backup database
docker exec einvoice-db pg_dump -U einvoice_user einvoice_prod > backup.sql

# Restore database
docker exec -i einvoice-db psql -U einvoice_user einvoice_prod < backup.sql
```

### **System Maintenance**

```bash
# Check disk usage
df -h

# Check Docker disk usage
docker system df

# Clean up Docker (removes unused images, containers, networks)
docker system prune -a

# View system resources
htop

# Check memory usage
free -h

# Check running processes
ps aux | grep node
```

---

## 🚨 **Step 19: Troubleshooting**

### **Issue: Containers Keep Restarting**

```bash
# Check logs for errors
docker logs einvoice-backend --tail 100

# Common causes:
# - Database connection failed
# - Environment variables missing
# - Port already in use
```

**Solution:**
```bash
# Verify environment variables
docker exec einvoice-backend env | grep DATABASE_URL

# Check port conflicts
sudo netstat -tulpn | grep :8000

# Restart with clean state
docker compose -f docker-compose.production.yml down -v
docker compose -f docker-compose.production.yml up -d
```

### **Issue: Can't Access Application**

**Check:**
1. Containers running: `docker ps`
2. Nginx running: `sudo systemctl status nginx`
3. Firewall: `sudo ufw status`
4. Port listening: `sudo netstat -tulpn | grep :80`

**Solution:**
```bash
# Restart nginx
sudo systemctl restart nginx

# Check nginx error log
sudo tail -f /var/log/nginx/error.log

# Restart containers
docker compose -f ~/apps/e-invoice/docker-compose.production.yml restart
```

### **Issue: Database Migration Fails**

```bash
# Check database is running
docker exec einvoice-db pg_isready -U einvoice_user

# Check database logs
docker logs einvoice-db

# Reset database (WARNING: deletes all data)
docker compose -f docker-compose.production.yml down -v
docker compose -f docker-compose.production.yml up -d
docker exec einvoice-backend npx prisma migrate deploy
```

### **Issue: Out of Disk Space**

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a -f

# Clean apt cache
sudo apt clean
sudo apt autoremove -y

# Remove old log files
sudo journalctl --vacuum-time=3d
```

---

## 📱 **Step 20: Access from Anywhere**

### **Option A: Using IP Address**
- `http://YOUR_HETZNER_IP`
- Works immediately, no setup needed

### **Option B: Using Domain**
- `https://yourdomain.com`
- Requires domain + SSL setup (Steps 17 & 10)

### **Option C: Using Hetzner DNS**
1. Hetzner Cloud Console → **DNS** → Create zone
2. Add A record pointing to your server
3. Access via: `https://your-app.hetzner-dns.com`

---

## 🔄 **Complete Deployment Checklist**

- [  ] **Step 1**: Server access working (SSH)
- [  ] **Step 2**: Server secured (firewall, user created)
- [  ] **Step 3**: Docker installed and running
- [  ] **Step 4**: Additional tools installed (git, nginx, certbot)
- [  ] **Step 5**: Repository cloned to `/home/einvoice/apps/e-invoice`
- [  ] **Step 6**: `.env.production` created with strong secrets
- [  ] **Step 7**: Containers built and running (3 containers)
- [  ] **Step 8**: Database migrated (tables created)
- [  ] **Step 9**: Nginx configured and running
- [  ] **Step 10**: SSL certificate installed (if using domain)
- [  ] **Step 11**: Application accessible in browser
- [  ] **Step 12**: Monitoring tools installed
- [  ] **Step 13**: Backup script created and scheduled
- [  ] **Step 14**: Update script created
- [  ] **Step 15**: Performance optimizations applied
- [  ] **Step 16**: Security hardening complete
- [  ] **Step 17**: Domain configured (optional)
- [  ] **Step 18**: Tested all features (login, invoice, payment)
- [  ] **Step 19**: Troubleshooting steps reviewed
- [  ] **Step 20**: Access method decided

---

## 📊 **Resource Usage**

### **Expected Resource Consumption:**

```
Container       | CPU    | RAM      | Storage
----------------|--------|----------|----------
einvoice-db     | 2-5%   | 150MB    | 1-5GB
einvoice-backend| 5-10%  | 250MB    | 500MB
einvoice-frontend| 3-8%  | 150MB    | 200MB
nginx           | 1-2%   | 50MB     | 100MB
----------------|--------|----------|----------
TOTAL           | ~15%   | ~600MB   | ~2-6GB
```

**Your CX32 can easily handle this!** ✅

---

## 🆘 **Emergency Procedures**

### **If Something Goes Wrong**

```bash
# 1. Stop everything
docker compose -f ~/apps/e-invoice/docker-compose.production.yml down

# 2. Check logs
docker logs einvoice-backend --tail 100
docker logs einvoice-frontend --tail 100
docker logs einvoice-db --tail 100

# 3. Restart fresh
docker compose -f ~/apps/e-invoice/docker-compose.production.yml up -d

# 4. Run migrations again
docker exec einvoice-backend npx prisma migrate deploy
```

### **Restore from Backup**

```bash
# Stop containers
docker compose -f ~/apps/e-invoice/docker-compose.production.yml down

# Restore database
gunzip /home/einvoice/backups/db_backup_YYYYMMDD_HHMMSS.sql.gz
docker compose -f ~/apps/e-invoice/docker-compose.production.yml up -d einvoice-db
sleep 10
docker exec -i einvoice-db psql -U einvoice_user einvoice_prod < /home/einvoice/backups/db_backup_YYYYMMDD_HHMMSS.sql

# Restart all containers
docker compose -f ~/apps/e-invoice/docker-compose.production.yml up -d
```

---

## 🎓 **Advanced: CI/CD Pipeline (Optional)**

### **Auto-Deploy on Git Push**

```bash
# Install webhook listener
npm install -g webhook

# Create webhook config
nano ~/webhook.json
```

**Add:**
```json
[
  {
    "id": "update-einvoice",
    "execute-command": "/home/einvoice/update-einvoice.sh",
    "command-working-directory": "/home/einvoice/apps/e-invoice",
    "pass-arguments-to-command": [],
    "trigger-rule": {
      "match": {
        "type": "payload-hash-sha1",
        "secret": "your-webhook-secret",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature"
        }
      }
    }
  }
]
```

**Start webhook:**
```bash
webhook -hooks ~/webhook.json -verbose
```

**Setup in GitHub:**
- Repository → Settings → Webhooks → Add webhook
- Payload URL: `http://YOUR_SERVER_IP:9000/hooks/update-einvoice`
- Secret: (your-webhook-secret)
- Events: Push events

---

## 🌟 **Production Best Practices**

### **DO:**
- ✅ Use strong passwords (min 16 characters)
- ✅ Enable SSL/HTTPS
- ✅ Regular backups (automated daily)
- ✅ Monitor resource usage
- ✅ Keep Docker images updated
- ✅ Use environment variables for secrets
- ✅ Enable auto-restart on containers
- ✅ Setup log rotation

### **DON'T:**
- ❌ Expose unnecessary ports
- ❌ Use default passwords
- ❌ Run containers as root
- ❌ Store secrets in code
- ❌ Ignore security updates
- ❌ Skip backups
- ❌ Disable firewall

---

## 📞 **Support Resources**

### **Hetzner Support**
- **Docs**: https://docs.hetzner.com/
- **Community**: https://community.hetzner.com/
- **Support**: support@hetzner.com
- **Status**: https://status.hetzner.com/

### **Application Logs**
```bash
# Application logs
docker logs einvoice-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u docker -f
```

---

## ✅ **Deployment Complete!**

Your e-invoice application is now running on Hetzner Cloud!

**Access your application:**
- 🌐 Frontend: `http://YOUR_SERVER_IP` or `https://yourdomain.com`
- 🔧 Backend: `http://YOUR_SERVER_IP/health`
- 📊 Monitoring: `http://YOUR_SERVER_IP:19999` (if netdata installed)

**What you have:**
- ✅ Production-ready application
- ✅ Secure server setup
- ✅ Automated backups
- ✅ SSL/HTTPS (if domain configured)
- ✅ Easy updates
- ✅ Monitoring tools
- ✅ Firewall protection
- ✅ Auto-restart containers

---

## 🎯 **Quick Command Reference**

```bash
# View application
curl http://localhost:3000

# Check backend
curl http://localhost:8000/health

# View all containers
docker ps

# View container logs
docker logs einvoice-backend -f

# Restart application
docker compose -f ~/apps/e-invoice/docker-compose.production.yml restart

# Update application
/home/einvoice/update-einvoice.sh

# Backup database
/home/einvoice/backup-einvoice.sh

# Check disk space
df -h

# Check memory
free -h

# Monitor processes
htop
```

---

**Your e-invoice application is now live on Hetzner Cloud CX32!** 🚀✨

**All steps completed - your application is production-ready!** 🎉

