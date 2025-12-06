import axios from 'axios'
import { electronApi } from './electron'

// Base API URL - change this to your API endpoint
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7062/api'

// Detect if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('API Request:', config.method?.toUpperCase(), config.url)
    }
    
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('API Response:', response.status, response.config.url)
    }
    
    return response.data
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token')
          console.error('Unauthorized access')
          break
        case 403:
          console.error('Forbidden access')
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Server error')
          break
        default:
          console.error('API error:', data?.message || error.message)
      }
    } else if (error.request) {
      console.error('Network error:', error.message)
    } else {
      console.error('Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// API methods
export const api = {
  // GET request
  get(url, config = {}) {
    if (isElectron) {
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
      const token = localStorage.getItem('token')
      const headers = { ...config.headers }
      if (token) headers.Authorization = `Bearer ${token}`
      
      return electronApi.get(fullUrl, { ...config, headers })
    }
    return apiClient.get(url, config)
  },
  
  // POST request
  post(url, data = {}, config = {}) {
    if (isElectron) {
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
      const token = localStorage.getItem('token')
      const headers = { ...config.headers }
      if (token) headers.Authorization = `Bearer ${token}`
      
      return electronApi.post(fullUrl, data, { ...config, headers })
    }
    return apiClient.post(url, data, config)
  },
  
  // PUT request
  put(url, data = {}, config = {}) {
    if (isElectron) {
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
      const token = localStorage.getItem('token')
      const headers = { ...config.headers }
      if (token) headers.Authorization = `Bearer ${token}`
      
      return electronApi.put(fullUrl, data, { ...config, headers })
    }
    return apiClient.put(url, data, config)
  },
  
  // PATCH request
  patch(url, data = {}, config = {}) {
    if (isElectron) {
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
      const token = localStorage.getItem('token')
      const headers = { ...config.headers }
      if (token) headers.Authorization = `Bearer ${token}`
      
      return electronApi.patch(fullUrl, data, { ...config, headers })
    }
    return apiClient.patch(url, data, config)
  },
  
  // DELETE request
  delete(url, config = {}) {
    if (isElectron) {
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
      const token = localStorage.getItem('token')
      const headers = { ...config.headers }
      if (token) headers.Authorization = `Bearer ${token}`
      
      return electronApi.delete(fullUrl, { ...config, headers })
    }
    return apiClient.delete(url, config)
  }
}

// Export electron API for direct access
export { electronApi }

export default apiClient
