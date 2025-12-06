import { api } from './client'

// Example: User API endpoints
export const userApi = {
  // Get current user
  getCurrentUser() {
    return api.get('/user/me')
  },
  
  // Get user by ID
  getUser(id) {
    return api.get(`/users/${id}`)
  },
  
  // Update user
  updateUser(id, data) {
    return api.put(`/users/${id}`, data)
  },
  
  // Delete user
  deleteUser(id) {
    return api.delete(`/users/${id}`)
  }
}

// Example: Auth API endpoints
export const authApi = {
  // Login
  login(credentials) {
    return api.post('/Users/login', {
      userName: credentials.userName,
      password: credentials.password
    })
  },
  
  // Register
  register(userData) {
    return api.post('/auth/register', userData)
  },
  
  // Logout
  logout() {
    return api.post('/auth/logout')
  },
  
  // Refresh token
  refreshToken(token) {
    return api.post('/auth/refresh', { token })
  }
}

// Example: Posts API endpoints
export const postsApi = {
  // Get all posts
  getPosts(params = {}) {
    return api.get('/posts', { params })
  },
  
  // Get post by ID
  getPost(id) {
    return api.get(`/posts/${id}`)
  },
  
  // Create post
  createPost(data) {
    return api.post('/posts', data)
  },
  
  // Update post
  updatePost(id, data) {
    return api.put(`/posts/${id}`, data)
  },
  
  // Delete post
  deletePost(id) {
    return api.delete(`/posts/${id}`)
  }
}
