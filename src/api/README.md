# API Integration Guide

## Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `VITE_API_BASE_URL` in `.env` with your actual API endpoint.

## Usage

### Basic API Call

```javascript
import { api } from '@/api/client'

// GET request
const data = await api.get('/endpoint')

// POST request
const result = await api.post('/endpoint', { key: 'value' })

// PUT request
const updated = await api.put('/endpoint/123', { key: 'new value' })

// DELETE request
await api.delete('/endpoint/123')
```

### Using Predefined Endpoints

```javascript
import { userApi, authApi, postsApi } from '@/api/endpoints'

// User endpoints
const user = await userApi.getCurrentUser()
const userById = await userApi.getUser(123)

// Auth endpoints
const loginResult = await authApi.login({ email, password })
const registerResult = await authApi.register({ name, email, password })

// Posts endpoints
const posts = await postsApi.getPosts({ page: 1, limit: 10 })
const post = await postsApi.getPost(123)
```

### Using Auth Store (Pinia)

```javascript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Login
await authStore.login({ email, password })

// Register
await authStore.register({ name, email, password })

// Logout
await authStore.logout()

// Check authentication status
authStore.checkAuth()
console.log(authStore.isLoggedIn)
console.log(authStore.currentUser)
```

## Features

- ✅ Automatic token management (Bearer token)
- ✅ Request/Response interceptors
- ✅ Error handling (401, 403, 404, 500)
- ✅ Development logging
- ✅ Timeout configuration (10s)
- ✅ Environment variables support
- ✅ Pinia store for authentication
- ✅ TypeScript-ready structure

## Adding New Endpoints

Add your endpoints to `src/api/endpoints.js`:

```javascript
export const myApi = {
  getData() {
    return api.get('/my-endpoint')
  },
  
  postData(data) {
    return api.post('/my-endpoint', data)
  }
}
```
