# 🔧 Fix Nginx HTTPS Connection Refused

## ❌ **Error**
```
curl: (7) Failed to connect to invoizz.com port 443: Connection refused
```

## 🔍 **Cause**
Nginx isn't listening on port 443 (HTTPS) or the SSL configuration is incomplete.

---

## ✅ **Solution: Complete Nginx SSL Configuration**

### **Step 1: Check Current Nginx Config**

```bash
cat /etc/nginx/sites-available/einvoice
```

### **Step 2: Update Nginx Config with Certbot's SSL**

```bash
# Edit nginx config
sudo nano /etc/nginx/sites-available/einvoice
```

**Replace entire content with this:**

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name invoizz.com www.invoizz.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name invoizz.com www.invoizz.com;

    # SSL Configuration (added by certbot)
    ssl_certificate /etc/letsencrypt/live/invoizz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/invoizz.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Frontend (Next.js on port 3000)
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
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Proxy to Backend API (Express on port 8000)
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:8000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Static files and assets
    location /_next/static {
        proxy_pass http://localhost:3000/_next/static;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Save**: Ctrl+X, Y, Enter

### **Step 3: Test and Reload Nginx**

```bash
# Test configuration
sudo nginx -t

# Should show: "syntax is ok" and "test is successful"

# Reload nginx
sudo systemctl reload nginx

# Check nginx is running
sudo systemctl status nginx
```

### **Step 4: Verify Ports**

```bash
# Check nginx is listening on 443
sudo netstat -tulpn | grep :443

# Should show:
# tcp  0.0.0.0:443  LISTEN  nginx
```

### **Step 5: Test HTTPS**

```bash
# From your server
curl https://invoizz.com/health

# Should return: {"status":"ok","timestamp":"..."}

# Test API
curl https://invoizz.com/api/v1/health

# Should also return: {"status":"ok","timestamp":"..."}
```

---

## 🔥 **If Nginx Still Won't Start on 443**

### **Check for Port Conflicts**

```bash
# See what's using port 443
sudo lsof -i :443

# If something else is using it, stop that service
```

### **Check Firewall**

```bash
# Verify 443 is allowed
sudo ufw status

# If not allowed, add it
sudo ufw allow 443/tcp
sudo ufw reload
```

### **Restart Nginx Completely**

```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

---

## 🎯 **After Fix**

You should be able to:
- ✅ Access https://invoizz.com (see your app)
- ✅ Register new users
- ✅ Login successfully
- ✅ Use all features

---

**Update the nginx config and reload - HTTPS will work!** 🔒✨

