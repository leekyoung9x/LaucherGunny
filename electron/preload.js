const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Add your Electron APIs here
  platform: process.platform,
  
  // Auth events
  loginSuccess: () => ipcRenderer.send('login-success'),
  logout: () => ipcRenderer.send('logout'),
  
  // API calls
  apiRequest: (config) => ipcRenderer.invoke('api-request', config),
  
  // File operations
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', { filePath, content }),
  
  // System info
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
})
