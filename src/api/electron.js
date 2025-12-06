// Electron API client wrapper
// Provides a unified interface for API calls that work in both Electron and browser

class ElectronApiClient {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electronAPI
  }

  /**
   * Make an API request through Electron's main process
   * @param {Object} config - Request configuration
   * @param {string} config.method - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param {string} config.url - Full URL or path
   * @param {Object} config.data - Request body data
   * @param {Object} config.headers - Request headers
   * @param {Object} config.params - URL parameters
   * @returns {Promise<Object>} Response data
   */
  async request(config) {
    if (!this.isElectron) {
      throw new Error('Electron API is not available. Use axios client instead.')
    }

    const response = await window.electronAPI.apiRequest(config)

    if (!response.success) {
      const error = new Error(response.error.message)
      error.status = response.error.status
      error.data = response.error.data
      throw error
    }

    return response.data
  }

  /**
   * GET request
   */
  async get(url, config = {}) {
    return this.request({
      method: 'GET',
      url,
      ...config
    })
  }

  /**
   * POST request
   */
  async post(url, data, config = {}) {
    return this.request({
      method: 'POST',
      url,
      data,
      ...config
    })
  }

  /**
   * PUT request
   */
  async put(url, data, config = {}) {
    return this.request({
      method: 'PUT',
      url,
      data,
      ...config
    })
  }

  /**
   * PATCH request
   */
  async patch(url, data, config = {}) {
    return this.request({
      method: 'PATCH',
      url,
      data,
      ...config
    })
  }

  /**
   * DELETE request
   */
  async delete(url, config = {}) {
    return this.request({
      method: 'DELETE',
      url,
      ...config
    })
  }

  /**
   * Read file from disk
   */
  async readFile(filePath) {
    if (!this.isElectron) {
      throw new Error('File system access is only available in Electron')
    }

    const response = await window.electronAPI.readFile(filePath)
    
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }

  /**
   * Write file to disk
   */
  async writeFile(filePath, content) {
    if (!this.isElectron) {
      throw new Error('File system access is only available in Electron')
    }

    const response = await window.electronAPI.writeFile(filePath, content)
    
    if (!response.success) {
      throw new Error(response.error)
    }

    return true
  }

  /**
   * Get system information
   */
  async getSystemInfo() {
    if (!this.isElectron) {
      throw new Error('System info is only available in Electron')
    }

    return window.electronAPI.getSystemInfo()
  }
}

export const electronApi = new ElectronApiClient()
export default electronApi
