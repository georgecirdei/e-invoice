# 🚀 E-Invoice One-Click Launch Guide

I've created **multiple ways** to launch your application with one click!

---

## 🎯 Launch Options

### **Option 1: PowerShell Script** (Recommended for Windows) ⭐

**Simple one-click launch!**

```powershell
.\dev.ps1
```

**What it does:**
- ✅ Starts Docker (PostgreSQL + Redis)
- ✅ Starts Backend in new window
- ✅ Starts Frontend in new window
- ✅ Opens browser automatically
- ✅ Shows all URLs

**To stop:**
```powershell
.\stop-app.ps1
```

---

### **Option 2: Advanced Launcher** (Interactive)

**For more control:**

```powershell
.\start-app.ps1
```

**What it does:**
- ✅ Checks if Docker is running
- ✅ Installs dependencies (if needed)
- ✅ Starts all services
- ✅ Asks if you want to open browser
- ✅ Shows comprehensive status

**To stop:**
```powershell
.\stop-app.ps1
```

---

### **Option 3: VS Code Launch** (Best for Debugging)

**In VS Code:**

1. Press `F5` or click "Run and Debug" (▶️)
2. Select **"Full Stack: Launch All"**
3. ✅ Both backend and frontend start with debugging enabled

**Or run individual services:**
- "Backend: Launch" - Just backend
- "Frontend: Launch" - Just frontend

**To stop:** Click stop button (⏹️) or press `Shift+F5`

---

### **Option 4: VS Code Tasks**

**From VS Code Command Palette (`Ctrl+Shift+P`):**

1. Type: **"Tasks: Run Task"**
2. Select:
   - **"Start All Services"** - Starts everything
   - **"Start Backend"** - Just backend
   - **"Start Frontend"** - Just frontend
   - **"Start Docker Services"** - Just databases
   - **"Prisma Studio"** - Database GUI

---

### **Option 5: Manual Start** (Traditional)

```powershell
# Terminal 1: Docker
docker-compose up -d

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

---

## 📋 Comparison

| Method | Speed | Ease | Debugging | Best For |
|--------|-------|------|-----------|----------|
| **dev.ps1** | ⚡⚡⚡ | ⭐⭐⭐ | ❌ | Quick daily use |
| **start-app.ps1** | ⚡⚡ | ⭐⭐⭐ | ❌ | First-time setup |
| **VS Code Launch (F5)** | ⚡⚡ | ⭐⭐ | ✅ | Development & debugging |
| **VS Code Tasks** | ⚡⚡ | ⭐⭐ | ❌ | Selective service start |
| **Manual** | ⚡ | ⭐ | ✅ | Maximum control |

---

## 🎬 Quick Start Guide

### For Daily Development:

```powershell
# Start everything
.\dev.ps1

# Work on your code...

# Stop when done
.\stop-app.ps1
```

### For Debugging:

1. Open VS Code
2. Press `F5`
3. Select "Full Stack: Launch All"
4. Set breakpoints
5. Debug your code!

---

## 📂 Files Created

```
.vscode/
├── launch.json         ✅ Debug configurations
├── tasks.json          ✅ VS Code tasks
├── settings.json       ✅ Workspace settings
└── extensions.json     ✅ Recommended extensions

Root:
├── dev.ps1            ✅ Quick launcher (auto-fixes ports!)
├── start-app.ps1      ✅ Advanced launcher
├── stop-app.ps1       ✅ Stop all services (improved!)
└── kill-port.ps1      ✅ Kill specific port (NEW!)
```

---

## 🔧 VS Code Recommended Extensions

The following extensions will be suggested when you open the project:

- ✅ **ESLint** - Code linting
- ✅ **Prettier** - Code formatting
- ✅ **GitLens** - Git integration
- ✅ **TypeScript** - TypeScript support
- ✅ **Prisma** - Database ORM
- ✅ **Docker** - Container management
- ✅ **Thunder Client** - API testing
- ✅ **Tailwind CSS IntelliSense** - CSS autocomplete

**Install them all:** VS Code will prompt you automatically!

---

## 🎯 Usage Examples

### Daily Workflow

```powershell
# Morning: Start work
.\dev.ps1

# ... code, test, commit ...

# Evening: End work
.\stop-app.ps1
```

### Debugging Session

1. Set breakpoint in backend code
2. Press `F5` in VS Code
3. Select "Backend: Launch"
4. Make API call from frontend
5. Debugger stops at breakpoint!

### View Database

While app is running:

```powershell
cd backend
npm run prisma:studio
```

Opens at: http://localhost:5555

---

## 🐛 Troubleshooting

### PowerShell Script Won't Run?

**Error:** "Execution policy"

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run the script again.

### Ports Already in Use?

```powershell
# Run the stop script first
.\stop-app.ps1

# Then start again
.\dev.ps1
```

### Docker Not Starting?

1. Make sure Docker Desktop is running
2. Check Docker Desktop status
3. Restart Docker Desktop if needed

---

## ⚡ Pro Tips

### Fastest Development Loop

1. Keep Docker running in background
2. Use `.\dev.ps1` to start backend/frontend
3. Code changes auto-reload (hot reload)
4. Use `.\stop-app.ps1` when done

### Multiple Projects?

Change ports in `.env` files:
- Backend: `PORT=8001`
- Frontend: Use Next.js `-p` flag

### Team Setup?

Share the scripts with your team:
```bash
git clone https://github.com/georgecirdei/e-invoice.git
cd e-invoice
.\dev.ps1
```

One command - everything works!

---

## 📊 What Each Script Does

### dev.ps1 (Quick Daily Use)
```
1. Start Docker ✅
2. Wait for DB ready ✅
3. Start Backend (new window) ✅
4. Start Frontend (new window) ✅
5. Open browser ✅
6. Done! 🎉
```

### start-app.ps1 (Advanced)
```
1. Check Docker running ✅
2. Start Docker ✅
3. Check/install dependencies ✅
4. Start Backend (new window) ✅
5. Start Frontend (new window) ✅
6. Ask about browser ✅
7. Show status ✅
```

### stop-app.ps1 (Cleanup)
```
1. Stop Docker ✅
2. Kill Backend process ✅
3. Kill Frontend process ✅
4. Clean shutdown ✅
```

---

## 🎨 VS Code Integration

### Launch Configurations

Press `F5` and choose:

1. **Full Stack: Launch All**
   - Starts both backend and frontend
   - Perfect for full-stack development

2. **Backend: Launch**
   - Just backend with debugging
   - For API development

3. **Frontend: Launch**
   - Just frontend
   - For UI development

### Tasks

Press `Ctrl+Shift+P` → "Tasks: Run Task" → Choose:

- **Start All Services** - Everything at once
- **Start Backend** - Just backend
- **Start Frontend** - Just frontend
- **Start Docker Services** - Just databases
- **Stop Docker Services** - Stop databases
- **Prisma Studio** - Database GUI

---

## 🌟 Recommended Daily Workflow

### Morning Setup (10 seconds)
```powershell
.\dev.ps1
```

### During Development
- Frontend auto-reloads on code changes
- Backend auto-restarts on code changes
- No need to manually restart!

### Testing
- Frontend: http://localhost:3000
- Backend: http://localhost:8000/health
- Database: `cd backend; npm run prisma:studio`

### End of Day (5 seconds)
```powershell
.\stop-app.ps1
```

---

## 🎁 Bonus Features

### Workspace Settings
- Auto-format on save (Prettier)
- ESLint auto-fix
- TypeScript IntelliSense
- Tailwind CSS autocomplete

### Search Optimizations
- node_modules excluded
- .next excluded
- Faster search results

---

## 📝 Summary

**To launch your entire application:**

```powershell
.\dev.ps1
```

**That's it!** ✨

One command starts:
- PostgreSQL database
- Redis cache
- Backend API server
- Frontend web app
- Opens browser

**Your complete development environment in 15 seconds!** 🚀

---

## 🔗 Quick Reference

| Action | Command |
|--------|---------|
| **Start All** | `.\dev.ps1` |
| **Stop All** | `.\stop-app.ps1` |
| **Debug in VS Code** | Press `F5` |
| **View Database** | `cd backend; npm run prisma:studio` |
| **Check Status** | `docker ps` |

---

**Happy developing! 🎉**

