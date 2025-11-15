# ✅ Payload CMS Activation Checklist

**Follow these steps to activate Payload CMS**

---

## Step 1: Add Environment Variables ⏸️ **DO THIS NOW**

**Open**: `backend/.env` in your editor

**Add these two lines at the bottom**:
```env
PAYLOAD_SECRET=e-invoice-super-secret-payload-key-change-in-production-min-32-chars
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:8000
```

**Save the file!** ✅

---

## Step 2: Media Directory ✅ **DONE**

✅ Media directory created at `backend/media`

---

## Step 3: Restart Backend 🔄 **NEXT**

**In your backend terminal**:

1. **Stop** current server (Press `Ctrl+C`)
2. **Run**: `npm run dev`

**Expected output**:
```
🚀 Server running on port 8000
📝 Payload CMS initialized
🎨 Payload Admin: http://localhost:8000/admin
```

**If you see this**, Payload is LIVE! ✅

---

## Step 4: Access Payload CMS 🎨

**Go to**: http://localhost:3000/admin

**Click**: "Open CMS" button (purple card)

**Payload admin opens**: http://localhost:8000/admin

**Login**: Use your Super Admin credentials (admin@admin.com)

---

## Step 5: Create First Page 📝

**In Payload Admin**:
1. Click "Pages" in sidebar
2. Click "Create New"
3. Fill in:
   - Title: "Home Page"
   - Slug: "home"
4. Add Hero block
5. Check "Is Published"
6. Save

**View at**: http://localhost:3000/cms/home

---

## 🎉 **You're Done!**

**When all steps complete, you'll have**:
- ✅ Working Payload CMS
- ✅ Landing page builder
- ✅ Contact form system
- ✅ No-code page creation

**Checklist**:
- [ ] Environment variables added
- [ ] Media directory created ✅
- [ ] Backend restarted
- [ ] CMS accessible
- [ ] First page created

**Complete all steps to activate!** 🚀

