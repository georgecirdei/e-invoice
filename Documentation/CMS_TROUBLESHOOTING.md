# 🔍 CMS Troubleshooting - Page Not Found

## ❓ **Why am I getting 404?**

**Possible reasons**:
1. Page wasn't created successfully
2. Page is not published (`isPublished = false`)
3. Slug doesn't match URL
4. Backend API not working
5. Database issue

---

## ✅ **Step-by-Step Debugging**

### **Step 1: Verify Page Was Created**

**Check in Admin Panel**:
1. Go to: http://localhost:3000/admin/pages
2. Do you see your page in the list?
3. What does it show?
   - ✅ Published or 📝 Draft?

**If you DON'T see the page**: It wasn't created. Try creating again.

**If you DO see the page**: Continue to Step 2.

---

### **Step 2: Check the Slug**

**Your URL**: http://localhost:3000/cms/contact-form

**Check your page**:
- **Slug should be**: `contact-form` (exact match)
- **NOT**: `contact` or `Contact Form` or `contact_form`

**Slug must match URL exactly!**

---

### **Step 3: Verify Page is Published**

**In the admin page list**:
- Look for: ✅ Published or 📝 Draft

**If it says "📝 Draft"**:
- The page exists but is NOT published
- Only published pages are visible
- You need to edit the page and publish it

**To publish**:
- Currently, the simple CMS doesn't have edit UI
- You need to recreate the page
- OR I can add publish/edit functionality

---

### **Step 4: Test Backend API Directly**

**Open in browser**: 
```
http://localhost:8000/api/v1/pages/contact-form
```

**What you should see**:
- If page exists: JSON data with your page
- If not found: `{"success":false,"message":"Page not found"}`

**This tells you if the backend can find the page.**

---

### **Step 5: Check Backend Console**

**Look at backend terminal**:
- Any errors when you try to access the page?
- API request showing up?

---

## 🔧 **Quick Fixes**

### **Fix 1: Recreate Page with Correct Slug**

**Go to**: http://localhost:3000/admin/pages

**Create page with**:
- Title: `Contact Form`
- **Slug**: `contact-form` (exactly as you want in URL)
- Blocks: Your JSON
- **Make sure to click "Create Page"**

---

### **Fix 2: Simple Test Page**

**Let's test with minimal page**:

**Go to**: http://localhost:3000/admin/pages  
**Click**: + Create Page

**Fill in**:
- **Title**: `Test Page`
- **Slug**: `test`
- **Blocks**: 
```json
[{"blockType":"hero","title":"Test Page","subtitle":"If you see this, CMS works!"}]
```

**Then visit**: http://localhost:3000/cms/test

**Should work!** If not, we have a deeper issue.

---

## 🐛 **Common Mistakes**

### **Mistake 1: Invalid JSON**
**Problem**: Blocks field has invalid JSON  
**Solution**: Validate JSON at https://jsonlint.com

### **Mistake 2: Wrong Slug**
**Problem**: Created with slug "contact" but visiting /cms/contact-form  
**Solution**: Slug must match URL exactly

### **Mistake 3: Not Published**
**Problem**: Page created but isPublished = false  
**Solution**: Currently no way to publish in simple CMS (limitation)

---

## 💡 **What I Can Add**

**If pages aren't working, I can**:

**A.** Add edit/publish functionality to admin UI  
**B.** Add better error messages  
**C.** Add page preview  
**D.** Add publish toggle  

**Would you like me to enhance the CMS UI?**

---

## 🔍 **Debug Checklist**

- [ ] Go to /admin/pages
- [ ] See if page is listed
- [ ] Check slug matches URL
- [ ] Check if marked as published
- [ ] Test backend API directly
- [ ] Try creating simple test page
- [ ] Check backend console for errors

---

## 🚀 **Quick Test**

**Try this**:
1. Go to: http://localhost:3000/admin/pages
2. Take screenshot of what you see
3. Let me know what's listed

**This will help me identify the issue!** 🔍

