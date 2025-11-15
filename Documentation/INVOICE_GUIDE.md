# 📄 Invoice Management Guide

Your e-invoice application now has a complete invoice creation and management system!

---

## 🎯 What You Can Do

### Invoice Management Features:
- ✅ Create invoices with multiple line items
- ✅ Automatic tax calculation
- ✅ Real-time total calculations
- ✅ Save as draft or submit
- ✅ View all invoices with search & filters
- ✅ Edit draft invoices
- ✅ Delete draft invoices
- ✅ Submit invoices for processing
- ✅ Track invoice status
- ✅ Automatic invoice numbering

---

## 🚀 How to Use Invoice Features

### 1. Create Your First Invoice

**Step 1: Go to Invoice Creation**
- From dashboard, click **"Create Invoice"**
- Or go to: http://localhost:3000/invoices/create

**Step 2: Select Customer**
- Choose from dropdown
- *Note: You must have at least one customer first!*
- If no customers, click "Add a customer first"

**Step 3: Set Invoice Details**
- **Invoice Date**: Date of invoice (cannot be future)
- **Due Date**: Payment due date (optional)
- **Currency**: Select currency (USD, EUR, GBP, etc.)
- **Notes**: Payment terms or additional info (optional)

**Step 4: Add Line Items**
- Click **"+ Add Item"**
- Enter:
  - **Description**: Product or service name
  - **Quantity**: Number of units
  - **Unit Price**: Price per unit
  - **Tax Rate %**: Tax percentage (e.g., 10 for 10%)
- Watch the **Total** calculate automatically!

**Step 5: Add More Items**
- Click **"+ Add Item"** again
- Add as many items as needed
- See **Subtotal, Tax, and Total** update in real-time

**Step 6: Create Invoice**
- Review all details
- Click **"Create Invoice"**
- ✅ Invoice created with unique number (e.g., INV-20251112-0001)

---

### 2. View All Invoices

**Go to:** http://localhost:3000/invoices

**You can:**
- See all invoices in a table
- Search by invoice number or customer name
- Filter by status (Draft, Submitted, Validated, etc.)
- View invoice details
- Edit or delete draft invoices

**Pagination:** Navigate through pages if you have many invoices

---

### 3. View Invoice Details

**Click "View"** on any invoice

**You'll see:**
- Invoice number and status
- Invoice date and due date
- Customer billing information
- Complete line items table
- Subtotal, tax, and total breakdown
- Invoice notes
- Creator information
- Created and submitted dates

**Actions Available:**
- **Edit** (if status = DRAFT)
- **Submit** (if status = DRAFT)
- **Download PDF** (coming soon)

---

### 4. Submit an Invoice

**From Invoice Detail Page:**
1. Make sure invoice is in **DRAFT** status
2. Review all details
3. Click **"Submit Invoice"**
4. Confirm submission
5. ✅ Status changes to **SUBMITTED**
6. Invoice can no longer be edited

---

## 💰 Invoice Calculations

### How Totals Are Calculated

**For Each Line Item:**
```
Subtotal = Quantity × Unit Price
Tax = Subtotal × (Tax Rate / 100)
Line Total = Subtotal + Tax
```

**For Entire Invoice:**
```
Invoice Subtotal = Sum of all line subtotals
Invoice Tax = Sum of all line taxes
Invoice Total = Invoice Subtotal + Invoice Tax
```

### Example:

| Item | Qty | Price | Tax % | Line Total |
|------|-----|-------|-------|------------|
| Product A | 2 | $100 | 10% | $220 |
| Product B | 1 | $50 | 10% | $55 |

```
Subtotal: $250.00
Tax:      $ 25.00
Total:    $275.00
```

---

## 📊 Invoice Status Workflow

```
DRAFT
  ↓ (Submit)
SUBMITTED
  ↓ (Government validates)
VALIDATED  or  REJECTED
  ↓
(Complete)
```

### Status Meanings:

| Status | Description | Can Edit? | Can Delete? |
|--------|-------------|-----------|-------------|
| **DRAFT** | Not yet submitted | ✅ Yes | ✅ Yes |
| **PENDING_APPROVAL** | Awaiting approval | ❌ No | ❌ No |
| **APPROVED** | Approved for submission | ❌ No | ❌ No |
| **SUBMITTED** | Sent to government | ❌ No | ❌ No |
| **VALIDATED** | Approved by government | ❌ No | ❌ No |
| **REJECTED** | Rejected by government | ❌ No | ❌ No |
| **CANCELLED** | Cancelled | ❌ No | ❌ No |

---

## 🔢 Invoice Numbering System

**Format:** `INV-YYYYMMDD-XXXX`

**Examples:**
- `INV-20251112-0001` (First invoice of Nov 12, 2025)
- `INV-20251112-0002` (Second invoice of same day)
- `INV-20251113-0001` (First invoice of next day)

**Features:**
- ✅ Unique per day
- ✅ Auto-generated
- ✅ Sequential numbering
- ✅ Date-based organization

---

## 📡 API Endpoints

### Invoice Management

```bash
# Get all invoices (with filters)
GET /api/v1/invoices?status=DRAFT&search=customer

# Create invoice
POST /api/v1/invoices
Body: {
  "customerId": "clxxx...",
  "invoiceDate": "2025-11-12",
  "dueDate": "2025-12-12",
  "currency": "USD",
  "lineItems": [
    {
      "description": "Product A",
      "quantity": 2,
      "unitPrice": 100,
      "taxRate": 10
    }
  ]
}

# Get invoice by ID
GET /api/v1/invoices/:id

# Update invoice
PUT /api/v1/invoices/:id

# Delete invoice (draft only)
DELETE /api/v1/invoices/:id

# Submit invoice
POST /api/v1/invoices/:id/submit

# Get statistics
GET /api/v1/invoices/stats
```

---

## 🧪 Testing Invoice Features

### Test 1: Create Invoice with PowerShell

```powershell
$token = "YOUR_ACCESS_TOKEN"
$headers = @{ "Authorization" = "Bearer $token" }

$body = @{
    customerId = "CUSTOMER_ID_HERE"
    invoiceDate = "2025-11-12"
    currency = "USD"
    lineItems = @(
        @{
            description = "Web Design Services"
            quantity = 10
            unitPrice = 100
            taxRate = 10
        },
        @{
            description = "Hosting Services"
            quantity = 1
            unitPrice = 50
            taxRate = 10
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/invoices" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

**Expected Result:**
- Invoice created with number INV-20251112-0001
- Total: $1,155.00 ($1,050 + $105 tax)
- Status: DRAFT

### Test 2: Create Invoice via UI

1. Go to http://localhost:3000/invoices/create
2. Select customer from dropdown
3. Set invoice date to today
4. Add first item:
   - Description: "Consulting Services"
   - Quantity: 5
   - Unit Price: 200
   - Tax Rate: 10
5. See total: $1,100 ($1,000 + $100 tax)
6. Add second item:
   - Description: "Support Package"
   - Quantity: 1
   - Unit Price: 500
   - Tax Rate: 10
7. See new total: $1,650 ($1,500 + $150 tax)
8. Click "Create Invoice"
9. ✅ Redirected to invoice list!

---

## 💡 Tips & Best Practices

### Before Creating Invoices:
1. ✅ Set up your organization
2. ✅ Add customers to your database
3. ✅ Review tax rates for your region

### When Creating Invoices:
- Use clear, descriptive line item descriptions
- Double-check quantities and prices
- Ensure tax rates are correct
- Add payment terms in notes
- Review totals before creating

### Managing Invoices:
- Keep drafts organized
- Submit invoices promptly
- Monitor validated vs rejected
- Use search to find specific invoices
- Filter by status for workflow management

---

## 📊 Dashboard Statistics

Your dashboard now shows REAL data:

- **Total Invoices**: All invoices created
- **Draft**: Invoices not yet submitted
- **Validated**: Successfully processed
- **Rejected**: Need attention

These update automatically as you create and submit invoices!

---

## 🔐 Security & Permissions

### Organization Scoped:
- ✅ Users can only see their organization's invoices
- ✅ Customers must belong to your organization
- ✅ Invoice numbers unique per organization

### Role-Based:
- **ADMIN/MANAGER**: Full invoice access
- **USER**: Can create and view own invoices
- **VIEWER**: View-only access

### Protected Actions:
- ✅ Can only edit DRAFT invoices
- ✅ Can only delete DRAFT invoices
- ✅ Submitted invoices are locked
- ✅ Organization isolation enforced

---

## 📈 Invoice Workflow Example

### Complete Flow:

**Day 1: Create Invoice**
1. Customer requests service
2. Go to /invoices/create
3. Add customer, items, calculate total
4. Save as DRAFT
5. Review with team

**Day 2: Submit Invoice**
1. Review draft invoice
2. Click "Submit Invoice"
3. Status → SUBMITTED
4. (Future: Sent to government API)

**Day 3: Validation**
1. Government validates
2. Status → VALIDATED
3. Invoice is official
4. (Future: PDF sent to customer)

**Day 4: Payment**
1. Customer pays
2. (Future: Mark as paid)
3. (Future: Generate receipt)

---

## 🎨 UI Pages

### Invoice List (/invoices)
```
┌─────────────────────────────────────────┐
│ Invoices                    [+ Create]  │
├─────────────────────────────────────────┤
│ Search: [________] Status: [All ▼] 🔍   │
├─────────────────────────────────────────┤
│ INV-001 | ABC Corp | $1,000 | DRAFT     │
│ INV-002 | XYZ Inc  | $2,500 | SUBMITTED │
│ INV-003 | Test Co  | $  500 | VALIDATED │
└─────────────────────────────────────────┘
```

### Create Invoice (/invoices/create)
```
┌─────────────────────────────────────────┐
│ Create Invoice                          │
├─────────────────────────────────────────┤
│ Customer: [ABC Corp ▼]                  │
│ Date: [2025-11-12] Due: [2025-12-12]    │
├─────────────────────────────────────────┤
│ Line Items                      [+ Add] │
│ ┌─────────────────────────────────────┐ │
│ │ Item #1                     [Remove]│ │
│ │ Desc: [Product A________]           │ │
│ │ Qty: [2] Price: [100] Tax: [10%]    │ │
│ │ Total: $220.00                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Subtotal: $200.00                       │
│ Tax:      $ 20.00                       │
│ Total:    $220.00                       │
│                                         │
│ [Create Invoice] [Cancel]               │
└─────────────────────────────────────────┘
```

---

## 🚧 Coming Soon

### Document Generation (Sprint 7 Week 6):
- 📄 PDF invoice generation
- 📄 XML export for government
- 📄 QR code on invoices
- 📧 Email to customers
- 💾 Document storage

### Compliance (Sprint 10+):
- 🏛️ Government API integration
- ✅ Real-time validation
- 📊 Compliance reporting
- 🔐 Digital signatures

---

## 📊 What You've Achieved

### Functional E-Invoice Platform (40% Complete):
```
✅ User Management
   - Registration, Login, Logout
   - JWT authentication
   - Password security

✅ Organization Management
   - Multi-tenant support
   - Team members
   - Role-based access

✅ Customer Management
   - Customer database
   - Search & filter
   - Full CRUD

✅ Invoice Management
   - Create with line items
   - Automatic calculations
   - Status workflow
   - Search & filter
   - Submit for processing
```

---

## 🎉 Test It Now!

### Quick Test Workflow:

```bash
# Make sure app is running
.\dev.ps1

# Or manually:
cd backend && npm run dev
cd frontend && npm run dev
```

**Then:**

1. **Login**: http://localhost:3000/login
2. **Setup Organization**: http://localhost:3000/organization/setup
3. **Add Customer**: http://localhost:3000/customers/add
4. **Create Invoice**: http://localhost:3000/invoices/create
5. **View Invoices**: http://localhost:3000/invoices
6. **Dashboard**: http://localhost:3000/dashboard (see statistics!)

---

## 📊 Project Progress

```
✅ Sprint 1-2 (Authentication):     100% COMPLETE
✅ Sprint 3-4 (Organizations):      100% COMPLETE  
✅ Sprint 7 Week 1 (Customers):     100% COMPLETE
✅ Sprint 7 Week 2-3 (Invoices):    100% COMPLETE ← YOU ARE HERE!
📋 Sprint 7 Week 6 (PDF/XML):         0% NEXT
📋 Sprint 10+ (Government API):       0% Future

Overall Project: 40% Complete
```

---

## 🎯 Next Steps

### Option 1: PDF Generation (Sprint 7 Week 6)
**Build:** PDF invoice generation, download, email
**Time:** 1 week

### Option 2: Government API Integration (Sprint 10+)
**Build:** Connect to government e-invoice system
**Time:** 2-3 weeks

### Option 3: Reporting & Analytics
**Build:** Advanced reports, charts, insights
**Time:** 2 weeks

---

## 📝 Invoice Data Fields

### Required Fields:
- ✅ Customer (must exist in database)
- ✅ Invoice Date
- ✅ At least one line item
- ✅ Line item description
- ✅ Line item quantity (> 0)
- ✅ Line item unit price (≥ 0)
- ✅ Line item tax rate (0-100%)

### Optional Fields:
- Due date
- Currency (defaults to USD)
- Notes
- Registration number
- Additional line items

---

## 🐛 Troubleshooting

### "You must belong to an organization"
**Solution:** Set up your organization first at /organization/setup

### "No customers found"
**Solution:** Add customers first at /customers/add

### "Invoice date cannot be in the future"
**Solution:** Select today or a past date

### "Due date must be after invoice date"
**Solution:** Set due date after invoice date, or leave blank

### "At least one line item is required"
**Solution:** Add at least one item with description, quantity, price

---

## 📚 Documentation

- **[STATUS.md](./STATUS.md)** - Current project status
- **[ORGANIZATION_GUIDE.md](./ORGANIZATION_GUIDE.md)** - Organization features
- **[LAUNCHER_GUIDE.md](./LAUNCHER_GUIDE.md)** - How to launch app
- **[Documentation/](./Documentation/)** - Complete technical docs

---

## 🎊 Congratulations!

You now have a **fully functional invoice management system**!

**What's Working:**
- ✅ Create multi-line invoices
- ✅ Automatic tax calculations
- ✅ Real-time totals
- ✅ Search and filter
- ✅ Status workflow
- ✅ Organization isolation
- ✅ Beautiful, responsive UI

**You've completed 40% of the entire project!** 🎉

---

**Start creating invoices:** http://localhost:3000/invoices/create

**Need help?** Check [Documentation/IMPLEMENTATION_PLAN.md](./Documentation/IMPLEMENTATION_PLAN.md)

