# 🧪 Authentication API Testing Guide

This guide shows you how to test all authentication endpoints.

## 📋 Available Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout user | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |

---

## 🚀 Testing with PowerShell

### 1. Register a New User

```powershell
$body = @{
    email = "test@example.com"
    password = "Test123456"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2025-11-12T15:30:00.000Z"
    }
  }
}
```

---

### 2. Login User

```powershell
$body = @{
    email = "test@example.com"
    password = "Test123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# Save tokens for later use
$accessToken = $response.data.accessToken
$refreshToken = $response.data.refreshToken

Write-Host "Access Token: $accessToken"
Write-Host "Refresh Token: $refreshToken"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6..."
  }
}
```

---

### 3. Get Current User (Protected Route)

```powershell
# Use the access token from login
$headers = @{
    "Authorization" = "Bearer $accessToken"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/me" `
    -Method GET `
    -Headers $headers
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2025-11-12T15:30:00.000Z",
      "organization": null
    }
  }
}
```

---

### 4. Refresh Access Token

```powershell
$body = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/refresh" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# Update access token
$accessToken = $response.data.accessToken
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clxxx...",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    }
  }
}
```

---

### 5. Logout User

```powershell
$body = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/logout" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🧪 Testing with curl

### 1. Register User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. Login User

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### 3. Get Current User

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Token

```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 5. Logout

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## ❌ Error Responses

### Invalid Email Format
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "code": "invalid_string",
      "message": "Invalid email address",
      "path": ["email"]
    }
  ]
}
```

### Weak Password
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "message": "Password must contain at least one uppercase letter",
      "path": ["password"]
    }
  ]
}
```

### User Already Exists
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Missing/Invalid Token
```json
{
  "success": false,
  "message": "No token provided"
}
```

---

## 🔐 Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)

**Valid Examples:**
- `Password123`
- `SecurePass1`
- `MyP@ssw0rd`

**Invalid Examples:**
- `password` (no uppercase or number)
- `PASSWORD123` (no lowercase)
- `Pass123` (too short)

---

## 📊 Testing Workflow

### Complete Registration & Login Flow

```powershell
# 1. Register
$registerBody = @{
    email = "john@example.com"
    password = "SecurePass123"
    firstName = "John"
    lastName = "Smith"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod `
    -Uri "http://localhost:8000/api/v1/auth/register" `
    -Method POST `
    -Body $registerBody `
    -ContentType "application/json"

Write-Host "✅ User registered: $($registerResponse.data.user.email)"

# 2. Login
$loginBody = @{
    email = "john@example.com"
    password = "SecurePass123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod `
    -Uri "http://localhost:8000/api/v1/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$accessToken = $loginResponse.data.accessToken
$refreshToken = $loginResponse.data.refreshToken

Write-Host "✅ Login successful"
Write-Host "Access Token: $accessToken"

# 3. Get user profile
$headers = @{ "Authorization" = "Bearer $accessToken" }

$userResponse = Invoke-RestMethod `
    -Uri "http://localhost:8000/api/v1/auth/me" `
    -Method GET `
    -Headers $headers

Write-Host "✅ User Profile:"
Write-Host "Name: $($userResponse.data.user.firstName) $($userResponse.data.user.lastName)"
Write-Host "Email: $($userResponse.data.user.email)"
Write-Host "Role: $($userResponse.data.user.role)"

# 4. Test refresh token
$refreshBody = @{ refreshToken = $refreshToken } | ConvertTo-Json

$refreshResponse = Invoke-RestMethod `
    -Uri "http://localhost:8000/api/v1/auth/refresh" `
    -Method POST `
    -Body $refreshBody `
    -ContentType "application/json"

Write-Host "✅ Token refreshed"

# 5. Logout
$logoutBody = @{ refreshToken = $refreshToken } | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:8000/api/v1/auth/logout" `
    -Method POST `
    -Body $logoutBody `
    -ContentType "application/json"

Write-Host "✅ Logged out successfully"
```

---

## 🎯 Quick Test Commands

Copy and paste these for quick testing:

```powershell
# Quick Register
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" -Method POST -Body '{"email":"test@test.com","password":"Test123456","firstName":"Test","lastName":"User"}' -ContentType "application/json"

# Quick Login
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" -Method POST -Body '{"email":"test@test.com","password":"Test123456"}' -ContentType "application/json"

# Quick Health Check
Invoke-RestMethod -Uri "http://localhost:8000/health"
```

---

## 📝 Notes

- Access tokens expire in 7 days (configurable via `JWT_EXPIRES_IN`)
- Refresh tokens expire in 30 days (configurable via `JWT_REFRESH_EXPIRES_IN`)
- Passwords are hashed using bcrypt with salt rounds of 12
- All passwords are validated for strength before registration
- JWT secret should be changed in production (set `JWT_SECRET` in `.env`)

---

## 🐛 Troubleshooting

**Server not responding?**
```bash
cd backend
npm run dev
```

**Database connection error?**
```bash
docker-compose up -d
cd backend
npm run prisma:generate
```

**View database records:**
```bash
cd backend
npm run prisma:studio
```

