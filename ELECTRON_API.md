# Electron API Integration

Complete integration of Electron IPC with Vue 3 for API calls and system operations.

## Features

✅ **API Requests through Electron Main Process**
- All HTTP requests routed through main process for better security
- Automatic token injection
- Support for GET, POST, PUT, PATCH, DELETE
- Unified interface works in both Electron and browser

✅ **File System Operations**
- Read files from disk
- Write files to disk
- Full Node.js file system access

✅ **System Information**
- Platform, architecture, version
- CPU, memory, hostname info

## Usage

### 1. Basic API Calls (Auto-detects Electron)

```javascript
import { api } from '@/api/client'

// Works in both Electron and browser
const data = await api.get('/users')
const result = await api.post('/users', { name: 'John' })
```

### 2. Direct Electron API Access

```javascript
import { electronApi } from '@/api/electron'

// Only works in Electron
const response = await electronApi.get('https://api.example.com/data')

// System info
const info = await electronApi.getSystemInfo()

// File operations
const content = await electronApi.readFile('/path/to/file.txt')
await electronApi.writeFile('/path/to/file.txt', 'content')
```

### 3. In Vue Components

```vue
<script setup>
import { electronApi } from '@/api/electron'
import { api } from '@/api/client'

// Unified API (auto-detects environment)
const users = await api.get('/users')

// Electron-specific features
if (electronApi.isElectron) {
  const systemInfo = await electronApi.getSystemInfo()
  const fileContent = await electronApi.readFile('/tmp/data.json')
}
</script>
```

## Architecture

```
Vue Component
    ↓
src/api/client.js (unified interface)
    ↓
├─→ Browser: axios (direct HTTP)
└─→ Electron: src/api/electron.js
        ↓
    electron/preload.js (IPC invoke)
        ↓
    electron/main.js (actual HTTP request via axios)
```

## Benefits

1. **Security**: API calls go through main process, can add extra validation
2. **Flexibility**: Same code works in browser and Electron
3. **Access**: Full Node.js capabilities (file system, system info, etc.)
4. **Centralized**: All API logic in one place with automatic token handling

## API Demo

Visit `/electron-api` route to see live demo of:
- System information retrieval
- HTTP API requests
- File read/write operations
