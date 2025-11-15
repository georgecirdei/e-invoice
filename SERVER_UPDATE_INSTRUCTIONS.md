# 🔄 Update E-Invoice on Hetzner Server

## Since the directory already exists, use these commands:

```bash
# 1. Go to existing directory
cd ~/apps/e-invoice

# 2. Remove old git (it was pointing to wrong level)
rm -rf .git

# 3. Initialize new git
git init

# 4. Add remote
git remote add origin https://github.com/georgecirdei/e-invoice.git

# 5. Pull latest clean repository
git fetch origin
git reset --hard origin/main

# 6. You should now have clean e-invoice code!
ls -la

# 7. Continue with deployment
docker compose -f docker-compose.production.yml build
```

---

## ✅ This will:
- Remove the old git configuration
- Connect to the clean GitHub repository
- Download all the latest clean code
- Ready for Docker build

