const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Add your Electron APIs here
  platform: process.platform,
  
  // Auth events
  loginSuccess: () => ipcRenderer.send('login-success'),
  logout: () => ipcRenderer.send('logout'),
  send: (channel, data) => ipcRenderer.send(channel, data),
  showMainWindow: () => ipcRenderer.send('show-main-window'),
  
  // API calls
  apiRequest: (config) => ipcRenderer.invoke('api-request', config),
  
  // File operations
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', { filePath, content }),
  
  // System info
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  checkLoginStatus: () => ipcRenderer.invoke('check-login-status'),
  
  // Cache management
  clearCache: () => ipcRenderer.invoke('clear-cache')
})
