import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let loginWindow = null
let mainWindow = null
let isLoggingOut = false

function createLoginWindow() {
  const iconPath = process.env.VITE_DEV_SERVER_URL 
    ? path.join(__dirname, '../build/icon.ico')
    : path.join(__dirname, '../build/icon.ico')
  
  loginWindow = new BrowserWindow({
    width: 400,
    height: 500,
    resizable: false,
    frame: true,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    loginWindow.loadURL(process.env.VITE_DEV_SERVER_URL + '#/login')
  } else {
    loginWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: 'login'
    })
  }

  loginWindow.on('closed', () => {
    loginWindow = null
    // Quit app if login window is closed and no main window exists
    if (!mainWindow && !isLoggingOut) {
      app.quit()
    }
  })
}

function createMainWindow() {
  const iconPath = process.env.VITE_DEV_SERVER_URL 
    ? path.join(__dirname, '../build/icon.ico')
    : path.join(__dirname, '../build/icon.ico')
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC handler for login success
ipcMain.on('login-success', () => {
  if (loginWindow) {
    loginWindow.close()
  }
  createMainWindow()
})

// IPC handler for logout
ipcMain.on('logout', () => {
  isLoggingOut = true
  
  setTimeout(() => {
    if (mainWindow) {
      mainWindow.close()
    }
  }, 200)
  
  // Wait a bit for main window to close, then create login window
  setTimeout(() => {
    createLoginWindow()
    isLoggingOut = false
  }, 100)
})

// API Handlers
ipcMain.handle('api-request', async (event, { method, url, data, headers, params }) => {
  try {
    const config = {
      method,
      url,
      headers: headers || {},
      timeout: 30000
    }

    if (data) {
      config.data = data
    }

    if (params) {
      config.params = params
    }

    const response = await axios(config)
    
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    }
  }
})

// File system operations
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const fs = await import('fs/promises')
    const content = await fs.readFile(filePath, 'utf-8')
    return { success: true, data: content }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('write-file', async (event, { filePath, content }) => {
  try {
    const fs = await import('fs/promises')
    await fs.writeFile(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// System info
ipcMain.handle('get-system-info', async () => {
  const os = await import('os')
  return {
    platform: process.platform,
    arch: process.arch,
    version: process.version,
    hostname: os.hostname(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem()
  }
})

// Check login status
ipcMain.handle('check-login-status', async () => {
  // This will be called from renderer to check localStorage
  return { needsCheck: true }
})

// Switch to main window (called when token exists)
ipcMain.on('show-main-window', () => {
  if (loginWindow) {
    loginWindow.close()
  }
  if (!mainWindow) {
    createMainWindow()
  }
})

app.whenReady().then(() => {
  // Always start with login window, let the renderer decide
  createLoginWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createLoginWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
