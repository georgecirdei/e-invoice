# 🏢 Organization Management Guide

Your e-invoice application now supports complete organization management with multi-tenant architecture!

---

## 🎯 What's New

You can now:
- ✅ Create and manage organizations
- ✅ Invite team members
- ✅ Assign roles (Admin, Manager, User, Viewer)
- ✅ Edit organization details
- ✅ View organization statistics
- ✅ Multi-tenant support (invoices scoped to organizations)

---

## 🚀 How to Use Organization Features

### 1. Set Up Your Organization

After logging in, if you don't have an organization:

**Go to:** http://localhost:3000/organization/setup

**Or:** Click "Set Up Now" in the dashboard alert

**Fill in:**
- Organization name (e.g., "Acme Corporation")
- Tax ID (e.g., "123456789")
- Registration number (optional)
- Email address
- Phone, address, city, state, country (optional)

**Click:** "Create Organization"

✅ You'll be automatically set as **ADMIN** and redirected to dashboard

---

### 2. View & Edit Organization

**Go to:** http://localhost:3000/organization/settings

**Or:** Click "Settings" on the organization card in dashboard

**You can:**
- View organization details
- Edit any information
- See organization statistics (members, invoices, customers)
- Navigate to member management

---

### 3. Manage Team Members

**Go to:** http://localhost:3000/organization/members

**Or:** Click "Manage Members" from organization settings

#### Add a New Member

1. Click **"+ Add Member"**
2. Enter the **user's email** (they must be registered)
3. Select a **role**:
   - **ADMIN** - Full access to everything
   - **MANAGER** - Manage invoices, customers, reports
   - **USER** - Create and manage own invoices
   - **VIEWER** - View-only access
4. Click **"Add Member"**

#### Update Member Role

1. Find the member in the list
2. Use the **dropdown** to select new role
3. ✅ Role updates automatically

#### Remove Member

1. Find the member in the list
2. Click **"Remove"** button
3. Confirm the action
4. ✅ Member removed from organization

---

## 🔐 Role Permissions

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access - Manage organization, members, invoices, customers, settings |
| **MANAGER** | Manage invoices, customers, and view reports |
| **USER** | Create and manage own invoices |
| **VIEWER** | View-only access to invoices and reports |

---

## 📡 API Endpoints

### Organization Management

```bash
# Get current user's organization
GET /api/v1/organizations/me

# Create organization
POST /api/v1/organizations
Body: {
  "name": "Acme Corp",
  "taxId": "123456789",
  "email": "contact@acme.com",
  "country": "United States"
}

# Update organization
PUT /api/v1/organizations/:id
Body: {
  "name": "Updated Name",
  "phone": "+1 234 567 8900"
}

# Get organization by ID
GET /api/v1/organizations/:id
```

### Member Management

```bash
# Add member to organization
POST /api/v1/organizations/:id/members
Body: {
  "email": "user@example.com",
  "role": "USER"
}

# Remove member from organization
DELETE /api/v1/organizations/:id/members/:userId

# Update member role
PATCH /api/v1/organizations/:id/members/:userId/role
Body: {
  "role": "MANAGER"
}
```

---

## 🧪 Testing Organization Features

### Test 1: Create Organization

```powershell
# Make sure you're logged in and have a token
$token = "YOUR_ACCESS_TOKEN_FROM_LOGIN"

$headers = @{ "Authorization" = "Bearer $token" }
$body = @{
    name = "My Test Company"
    taxId = "TEST123456"
    email = "company@test.com"
    country = "United States"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/organizations" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

### Test 2: Get Your Organization

```powershell
$headers = @{ "Authorization" = "Bearer $token" }

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/organizations/me" `
    -Method GET `
    -Headers $headers
```

### Test 3: Add Member (UI Testing)

1. Go to http://localhost:3000/organization/members
2. Click "+ Add Member"
3. Enter email of another registered user
4. Select role
5. Click "Add Member"
6. ✅ Member appears in list

---

## 💡 Workflow Example

### Setting Up a New Organization

**Scenario:** You just registered and logged in

**Step 1:** Dashboard shows alert "Set up your organization"

**Step 2:** Click "Set Up Now"
- Fills in company details
- Submits form
- Organization created!

**Step 3:** Dashboard now shows organization card
- Organization name
- Tax ID
- Member count

**Step 4:** Invite team members
- Click organization Settings
- Click "Manage Members"
- Add team members
- Assign roles

**Step 5:** Team members can now:
- Login to their accounts
- See the organization
- Create invoices (coming soon)
- Access features based on their role

---

## 🔄 Organization Flow Diagram

```
User Registers
     ↓
User Logs In
     ↓
Dashboard → No Organization?
     ↓              ↓
     Yes           No
     ↓              ↓
Show Org Info    Show "Set Up Organization" Alert
     ↓              ↓
Can:              Click "Set Up Now"
- View stats           ↓
- Edit settings   Fill Organization Form
- Manage members      ↓
- Create invoices Organization Created
                      ↓
                  User becomes ADMIN
                      ↓
                  Can invite members
                      ↓
                  Multi-tenant ready!
```

---

## 🎨 UI Pages

### Organization Setup
- **URL:** http://localhost:3000/organization/setup
- **Purpose:** Create new organization
- **Requires:** Authenticated user without organization

### Organization Settings
- **URL:** http://localhost:3000/organization/settings
- **Purpose:** View/edit organization details
- **Requires:** Authenticated user with organization

### Member Management
- **URL:** http://localhost:3000/organization/members
- **Purpose:** Manage team members and roles
- **Requires:** Authenticated ADMIN user

---

## 🐛 Troubleshooting

### "You are not part of any organization"

**Solution:**
1. Go to http://localhost:3000/organization/setup
2. Create an organization
3. You'll be automatically added as ADMIN

### "Only administrators can add members"

**Solution:**
- Only users with ADMIN role can manage members
- Check your role in dashboard
- Contact your organization admin

### "User is already part of an organization"

**Solution:**
- Users can only belong to one organization at a time
- They must leave their current organization first
- Or use a different email address

### "User not found with this email"

**Solution:**
- The user must first register in the system
- Ask them to create an account at /register
- Then you can add them to your organization

---

## 📊 Organization Statistics

On the Settings page, you can see:
- **Members** - Total team members
- **Invoices** - Total invoices created
- **Customers** - Total customers added

These update automatically as you use the system!

---

## 🔒 Security Features

- ✅ Only ADMIN users can add/remove members
- ✅ Only ADMIN users can update organization details
- ✅ Users can only access their own organization
- ✅ Cannot remove yourself from organization
- ✅ Cannot change your own role
- ✅ Unique tax IDs and registration numbers
- ✅ Organization-scoped data access

---

## 📋 Next Features

After organizations, you can build:

1. **Invoice Management** (Sprint 7-9)
   - Create invoices
   - Add line items
   - Calculate taxes
   - Generate PDFs

2. **Customer Management** (Sprint 7-9)
   - Add customers
   - Customer database
   - Link to invoices

3. **Advanced Features**
   - Reporting & analytics
   - Government API integration
   - Email notifications
   - Document templates

---

## 🎉 You Now Have:

- ✅ User authentication
- ✅ Organization management
- ✅ Multi-tenant architecture
- ✅ Team collaboration
- ✅ Role-based permissions

**Ready for invoice management!** 🚀

---

**Questions? Check the main [Documentation](./Documentation/) or see [WHAT_TO_DO_NEXT.md](./WHAT_TO_DO_NEXT.md)**

