import { defineStore } from 'pinia'
import { authApi } from '@/api/endpoints'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),
  
  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated
  },
  
  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        const response = await authApi.login(credentials)
        
        // Store token
        this.token = response.token
        this.user = response.user
        this.isAuthenticated = true
        
        localStorage.setItem('token', response.token)
        
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await authApi.register(userData)
        
        // Auto login after register
        this.token = response.token
        this.user = response.user
        this.isAuthenticated = true
        
        localStorage.setItem('token', response.token)
        
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async logout() {
      try {
        await authApi.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Clear state regardless of API call result
        this.token = null
        this.user = null
        this.isAuthenticated = false
        
        localStorage.removeItem('token')
      }
    },
    
    // Check if user is already logged in
    checkAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        this.isAuthenticated = true
        // Optionally fetch user data here
      }
    }
  }
})
