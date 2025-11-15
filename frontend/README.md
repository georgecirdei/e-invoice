# E-Invoice Frontend

Modern web interface for the e-invoice system built with Next.js, React, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Backend API running on http://localhost:8000

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Create .env.local file
   cp .env.local.example .env.local
   
   # Update with your backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   ├── dashboard/     # Dashboard (protected)
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   └── globals.css    # Global styles
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Alert.tsx
│   │   └── auth/         # Auth-specific components
│   │       └── ProtectedRoute.tsx
│   ├── services/         # API services
│   │   └── auth.service.ts
│   ├── store/            # State management (Zustand)
│   │   └── authStore.ts
│   ├── lib/              # Utilities
│   │   └── api.ts        # Axios client
│   └── types/            # TypeScript types
│       └── auth.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Lint code
- `npm run type-check` - TypeScript type checking

## 🎨 Features

### Current Features ✅
- **Authentication**
  - User registration with validation
  - Login with email/password
  - JWT token management
  - Protected routes
  - Logout functionality

- **UI Components**
  - Button component with variants
  - Input component with validation
  - Card components
  - Alert component
  - Responsive design

- **State Management**
  - Zustand for auth state
  - Persistent storage (localStorage)
  - Auto-refresh on page reload

### Coming Soon 🚧
- Invoice management
- Customer management
- Reporting & analytics
- User profile management
- Organization settings

## 🔐 Authentication Flow

1. **Register:**
   - Visit `/register`
   - Fill in email, password, name
   - Account created
   - Redirect to login

2. **Login:**
   - Visit `/login`
   - Enter credentials
   - Receive JWT tokens
   - Redirect to dashboard

3. **Access Protected Routes:**
   - Token automatically attached to requests
   - Redirects to login if not authenticated
   - Auto-logout on token expiration

## 📝 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=E-Invoice
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_ENVIRONMENT=development
```

## 🎨 UI Components

### Button
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg" isLoading={false}>
  Click Me
</Button>
```

### Input
```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email"
  type="email"
  error="Invalid email"
  placeholder="john@example.com"
/>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

## 🧪 Testing

### Test Authentication

1. **Start backend:** Make sure backend is running on port 8000
2. **Start frontend:** `npm run dev`
3. **Register:** Go to http://localhost:3000/register
4. **Login:** Go to http://localhost:3000/login
5. **Dashboard:** View http://localhost:3000/dashboard

## 🚢 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

Set these in your hosting platform:
- `NEXT_PUBLIC_API_URL` - Your production API URL

## 🐛 Troubleshooting

**Build errors:**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

**Type errors:**
```bash
npm run type-check
```

**API connection errors:**
- Verify backend is running on correct port
- Check NEXT_PUBLIC_API_URL in .env.local
- Verify CORS is configured in backend

## 📚 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios

## 📞 Support

For issues and questions:
1. Check the main [project documentation](../Documentation/)
2. Review backend API at http://localhost:8000/health
3. Check browser console for errors

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

