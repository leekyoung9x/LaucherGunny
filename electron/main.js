const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const axios = require('axios')
const https = require('https')
const fs = require('fs').promises
const os = require('os')

// __dirname is already available in CommonJS, no need to redefine it

// Disable security warnings in development
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

// Create axios instance with SSL certificate validation disabled for development
// WARNING: Only use this in development. For production, use proper SSL certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

let loginWindow = null
let mainWindow = null
let isLoggingOut = false

//region enable flash
let pluginName = null; //put the right flash plugin in depending on the operating system.
switch (process.platform) {
  case 'win32':
      pluginName = 'pepflashplayer.dll';
    break
  case 'linux':
      pluginName = 'libpepflashplayer.so';
      app.commandLine.appendSwitch('no-sandbox');
    break;
  case 'darwin':
    pluginName = 'PepperFlashPlayer.plugin'
    break;
}
app.commandLine.appendSwitch("disable-renderer-backgrounding");
if (process.platform !== "darwin") {
  app.commandLine.appendSwitch('high-dpi-support', "1");
  //app.commandLine.appendSwitch('force-device-scale-factor', "1");
  app.commandLine.appendSwitch("--enable-npapi");
}
//
// app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, 'flashver/' + pluginName));
console.log(path.join(__dirname.includes(".asar") ? process.resourcesPath : __dirname, "flashver/" + pluginName));
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname.includes(".asar") ? process.resourcesPath : __dirname, "flashver/" + pluginName));
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
app.commandLine.appendSwitch('allow-insecure-localhost', 'true');
app.commandLine.appendSwitch('incognito');
//endregion

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
      preload: path.join(__dirname, '../electron/preload.js'),
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

  // Set Content Security Policy
  loginWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: data: blob:"]
      }
    })
  })

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
      preload: path.join(__dirname, '../electron/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      plugins: true,
      webSecurity: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: data: blob:"]
      }
    })
  })

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

    // Only add HTTPS agent for HTTPS URLs
    if (url.startsWith('https://')) {
      config.httpsAgent = httpsAgent
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
    const content = await fs.readFile(filePath, 'utf-8')
    return { success: true, data: content }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('write-file', async (event, { filePath, content }) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// System info
ipcMain.handle('get-system-info', async () => {
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
