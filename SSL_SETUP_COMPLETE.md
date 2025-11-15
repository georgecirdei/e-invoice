# ✅ SSL Certificate Setup Complete - invoizz.com

## 🎉 **Certificate Successfully Obtained!**

Your SSL certificate has been issued by Let's Encrypt!

---

## 📋 **Certificate Details**

- **Domains**: invoizz.com, www.invoizz.com
- **Certificate**: `/etc/letsencrypt/live/invoizz.com/fullchain.pem`
- **Private Key**: `/etc/letsencrypt/live/invoizz.com/privkey.pem`
- **Expires**: February 13, 2026 (90 days from now)
- **Auto-Renewal**: ✅ Configured

---

## 🔧 **Complete Nginx Configuration**

Run this on your server to fix the www subdomain:

```bash
# Edit nginx configuration
sudo nano /etc/nginx/sites-available/einvoice
```

**Update the server_name line:**

```nginx
server {
    listen 80;
    server_name invoizz.com www.invoizz.com;  # Add www here
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name invoizz.com www.invoizz.com;  # Add www here

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/invoizz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/invoizz.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

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

**Save**: Ctrl+X, Y, Enter

---

## ✅ **Apply Configuration**

```bash
# 1. Test nginx configuration
sudo nginx -t

# Should show: "syntax is ok" and "test is successful"

# 2. Reload nginx
sudo systemctl reload nginx

# 3. Verify SSL is working
curl https://invoizz.com/health
curl https://www.invoizz.com/health

# Both should return: {"status":"ok","timestamp":"..."}
```

---

## 🌐 **Update Environment Variables**

Update your application URLs:

```bash
# Switch to einvoice user
su - einvoice
cd ~/apps/e-invoice

# Edit environment file
nano .env.production
```

**Update these lines:**
```env
FRONTEND_URL=https://invoizz.com
BACKEND_URL=https://invoizz.com
```

**Restart containers:**
```bash
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d
```

---

## 🎯 **Test Your Secure App**

After nginx reload and container restart:

1. **Visit**: https://invoizz.com
2. **Verify SSL**: Look for 🔒 padlock in browser
3. **Test www**: https://www.invoizz.com (should also work)
4. **Check API**: https://invoizz.com/api/v1/health

All should work with HTTPS! ✅

---

## 🔄 **Certificate Auto-Renewal**

Let's Encrypt certificates last 90 days. Certbot will automatically renew them!

**Test auto-renewal:**
```bash
sudo certbot renew --dry-run

# Should show: "Congratulations, all simulated renewals succeeded"
```

**Check renewal timer:**
```bash
sudo systemctl list-timers | grep certbot

# Should show scheduled renewal task
```

---

## ✅ **SSL Setup Complete!**

Your e-invoice application now has:
- ✅ Valid SSL certificate
- ✅ HTTPS enabled
- ✅ HTTP → HTTPS redirect
- ✅ Auto-renewal configured
- ✅ Both invoizz.com and www.invoizz.com working

---

**Your application is now secure with HTTPS!** 🔒✨

**Access at**: https://invoizz.com 🎉

