const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron')
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
console.log('=== FLASH PLUGIN DEBUG ===');
console.log('Platform:', process.platform);
console.log('Electron version:', process.versions.electron);
console.log('Chrome version:', process.versions.chrome);

let pluginName = null; //put the right flash plugin in depending on the operating system.
switch (process.platform) {
  case 'win32':
      pluginName = 'pepflashplayer64_34_0_0_330.dll';
    break
  case 'linux':
      pluginName = 'libpepflashplayer.so';
      app.commandLine.appendSwitch('no-sandbox');
    break;
  case 'darwin':
    pluginName = 'FlashPlayer-10.6.plugin'
    break;
}

console.log('Flash plugin name:', pluginName);

// Critical Flash switches - MUST be set before app.ready
// In production build, flashver is unpacked to app.asar.unpacked/flashver
// In dev, it's in the project root
let flashPath;
if (__dirname.includes(".asar")) {
  // Production: flashver is unpacked next to app.asar
  flashPath = path.join(process.resourcesPath, "app.asar.unpacked", "flashver", pluginName);
} else {
  // Development: flashver is in project root
  flashPath = path.join(__dirname, "flashver", pluginName);
}

console.log('Flash plugin path:', flashPath);
console.log('Flash plugin exists:', require('fs').existsSync(flashPath));

// Flash plugin switches
app.commandLine.appendSwitch('ppapi-flash-path', flashPath);
app.commandLine.appendSwitch('ppapi-flash-version', '32.0.0.465');

// Enable plugins globally - CRITICAL FLAGS
app.commandLine.appendSwitch('enable-plugins');
app.commandLine.appendSwitch('allow-outdated-plugins');
app.commandLine.appendSwitch('always-authorize-plugins');
app.commandLine.appendSwitch('disable-features', 'FlashDeprecationWarning');

// Renderer settings
app.commandLine.appendSwitch("disable-renderer-backgrounding");
if (process.platform !== "darwin") {
  app.commandLine.appendSwitch('high-dpi-support', "1");
}

// Security and isolation
app.commandLine.appendSwitch('disable-site-isolation-trials');
// Removed no-sandbox to prevent renderer crash
// app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
app.commandLine.appendSwitch('allow-insecure-localhost', 'true');
// Cho phép chạy nội dung không an toàn từ Flash
app.commandLine.appendSwitch('allow-running-insecure-content');

console.log('✅ All Flash command line switches applied');
//endregion

function createLoginWindow() {
  // If login window already exists, just show it
  if (loginWindow) {
    loginWindow.show()
    return
  }
  
  // In production, build folder is in resources/build
  // In dev, it's relative to electron folder
  const iconPath = __dirname.includes('.asar')
    ? path.join(process.resourcesPath, 'build', 'icon.ico')
    : path.join(__dirname, '..', 'build', 'icon.ico')
  
  loginWindow = new BrowserWindow({
    width: 400,
    height: 500,
    resizable: false,
    frame: true,
    show: false,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      plugins: true,
      webSecurity: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    loginWindow.loadURL(process.env.VITE_DEV_SERVER_URL + '#/login')
  } else {
    // In production, dist-electron and dist are siblings in app.asar
    const distPath = path.join(__dirname, '..', 'dist', 'index.html')
    loginWindow.loadFile(distPath, {
      hash: 'login'
    })
  }

  // Show window when ready
  loginWindow.once('ready-to-show', () => {
    loginWindow.show()
  })

  // Enable Flash plugin
  loginWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'plugins') {
      callback(true)
    } else {
      callback(false)
    }
  })

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
  // In production, build folder is in resources/build
  // In dev, it's relative to electron folder
  const iconPath = __dirname.includes('.asar')
    ? path.join(process.resourcesPath, 'build', 'icon.ico')
    : path.join(__dirname, '..', 'build', 'icon.ico')
  
  mainWindow = new BrowserWindow({
    sandbox: false,
    width: 1006,
    height: 694,
    resizable: false,
    show: false,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true,
      webviewTag: true,
      plugins: true,
      webSecurity: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    // mainWindow.webContents.openDevTools()
  } else {
    // In production, dist-electron and dist are siblings in app.asar
    const distPath = path.join(__dirname, '..', 'dist', 'index.html')
    mainWindow.loadFile(distPath)
  }

  // CRITICAL: Allow Flash to run without user interaction
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission) => {
    if (permission === 'plugins') {
      return true;
    }
    return false;
  })

  // Enable Flash plugin
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log('\n=== PERMISSION REQUEST ===');
    console.log('Permission:', permission);
    if (permission === 'plugins') {
      console.log('✅ Plugins permission GRANTED');
      callback(true)
    } else {
      console.log('❌ Permission DENIED:', permission);
      callback(false)
    }
  })

  // Log when plugin is ready
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('\n=== PAGE LOADED ===');
    
    // Enable plugins for this specific page
    mainWindow.webContents.session.setPreloads([]);
    
    mainWindow.webContents.executeJavaScript(`
      console.log('Checking navigator.plugins...');
      console.log('Total plugins:', navigator.plugins.length);
      for (let i = 0; i < navigator.plugins.length; i++) {
        console.log('Plugin ' + i + ':', navigator.plugins[i].name, '-', navigator.plugins[i].description);
      }
      
      // Check if Flash is available
      const hasFlash = Array.from(navigator.plugins).some(p => 
        p.name.toLowerCase().includes('flash') || 
        p.name.toLowerCase().includes('shockwave')
      );
      console.log('Flash detected:', hasFlash);
      
      if (!hasFlash) {
        console.error('⚠️ Flash plugin NOT found in navigator.plugins');
        console.log('Available mimeTypes:');
        for (let i = 0; i < navigator.mimeTypes.length; i++) {
          console.log('  -', navigator.mimeTypes[i].type, ':', navigator.mimeTypes[i].description);
        }
      }
    `).catch(err => console.log('Error checking plugins:', err));
  })
  
  // Log plugin crashes or errors
  mainWindow.webContents.on('plugin-crashed', (event, name, version) => {
    console.error('❌ PLUGIN CRASHED:', name, version);
  })
  
  // Log when renderer process crashes
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('❌ RENDERER PROCESS GONE:', details);
  })
  
  // Monitor console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (message.includes('Flash') || message.includes('plugin')) {
      console.log(`[Renderer ${level}]:`, message);
    }
  })

  // Configure WebView to allow scripts and plugins
  mainWindow.webContents.on('will-attach-webview', (event, webPreferences, params) => {
    console.log('WebView attaching with URL:', params.src);
    
    // Remove sandbox to allow scripts
    delete webPreferences.preload
    
    // Enable required features for Flash
    webPreferences.plugins = true
    webPreferences.webSecurity = false
    webPreferences.allowRunningInsecureContent = true
    webPreferences.experimentalFeatures = true
    webPreferences.nodeIntegration = false
    webPreferences.contextIsolation = true
    
    console.log('✅ WebView preferences configured for Flash');
  })

  // Set Content Security Policy - Allow everything for Flash
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
          "script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
          "frame-src * data: blob:; " +
          "child-src * data: blob:; " +
          "object-src *; " +
          "connect-src *"
        ]
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
  
  // Create login window first to prevent app from quitting
  createLoginWindow()
  
  // Then close main window after a short delay
  setTimeout(() => {
    if (mainWindow) {
      mainWindow.close()
      mainWindow = null
    }
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

// Clear cache handler
ipcMain.handle('clear-cache', async () => {
  try {
    const { session } = require('electron')
    
    // Clear cache của tất cả sessions
    await session.defaultSession.clearCache()
    await session.defaultSession.clearStorageData({
      storages: [
        'appcache',
        'cookies', 
        'filesystem',
        'indexdb',
        'localstorage',
        'shadercache',
        'websql',
        'serviceworkers',
        'cachestorage'
      ]
    })
    
    console.log('✅ Cache cleared successfully')
    return { success: true, message: 'Cache đã được xóa thành công!' }
  } catch (error) {
    console.error('❌ Error clearing cache:', error)
    return { success: false, error: error.message }
  }
})

app.whenReady().then(() => {
  // Log all available plugins
  console.log('\n=== PLUGINS LOADED ===');
  const plugins = app.getAppMetrics();
  console.log('App metrics:', plugins);
  
  // Check if Flash is in the plugins list
  console.log('\nChecking for Flash plugin...');
  console.log('Plugin name to search:', pluginName);
    // Create menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Clear Cache',
          accelerator: 'CmdOrCtrl+Shift+Delete',
          click: async () => {
            const result = await dialog.showMessageBox({
              type: 'question',
              buttons: ['Hủy', 'Xóa Cache'],
              defaultId: 1,
              title: 'Xóa Cache',
              message: 'Bạn có chắc muốn xóa cache?',
              detail: 'Tất cả dữ liệu cache sẽ bị xóa (ảnh, config, xml...). App sẽ tải lại các file từ server.'
            })
            
            if (result.response === 1) {
              const { session } = require('electron')
              try {
                await session.defaultSession.clearCache()
                await session.defaultSession.clearStorageData({
                  storages: [
                    'appcache',
                    'cookies',
                    'filesystem',
                    'indexdb',
                    'localstorage',
                    'shadercache',
                    'websql',
                    'serviceworkers',
                    'cachestorage'
                  ]
                })
                
                dialog.showMessageBox({
                  type: 'info',
                  title: 'Thành công',
                  message: 'Cache đã được xóa thành công!',
                  detail: 'Vui lòng khởi động lại ứng dụng để thấy thay đổi.'
                })
                
                console.log('✅ Cache cleared successfully from menu')
              } catch (error) {
                console.error('❌ Error clearing cache:', error)
                dialog.showMessageBox({
                  type: 'error',
                  title: 'Lỗi',
                  message: 'Không thể xóa cache!',
                  detail: error.message
                })
              }
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'About',
              message: 'Launcher Gunny',
              detail: 'Version 1.0.0\nElectron + Vue 3 + Vite'
            })
          }
        }
      ]
    }
  ]
  
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
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
