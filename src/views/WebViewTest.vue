<template>
  <div class="webview-container">
    <h1>WebView Flash Test</h1>
    <p class="info">Testing Flash with WebView plugin enabled</p>
    
    <div class="controls">
      <input 
        v-model="testUrl" 
        type="text" 
        placeholder="Enter SWF URL to test"
        class="url-input"
      />
      <button @click="loadUrl" class="btn-load">Load SWF</button>
      <button @click="loadGameUrl" class="btn-game">Load Game</button>
    </div>

    <div class="webview-wrapper">
      <webview 
        ref="webview"
        id="flash-webview"
        :src="currentUrl"
        plugins
        allowpopups
        disablewebsecurity
        nodeintegration="true"
        webpreferences="allowRunningInsecureContent"
        style="width: 100%; height: 600px; border: 2px solid #4CAF50; background: #000;"
      ></webview>
    </div>

    <div class="debug-info">
      <h3>Debug Info:</h3>
      <p>Current URL: {{ currentUrl }}</p>
      <p>Status: {{ status }}</p>
      <button @click="checkPlugins" class="btn-check">Check Plugins</button>
      <button @click="reload" class="btn-reload">Reload</button>
      <button @click="openDevTools" class="btn-devtools">Open DevTools</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WebViewTest',
  data() {
    return {
      testUrl: 'http://localhost:5173/flash-loader.html',
      currentUrl: '',
      status: 'Ready',
      gameSwfUrl: 'http://129.212.239.167/flash/Loading.swf'
    }
  },
  mounted() {
    this.$nextTick(() => {
      const webview = this.$refs.webview
      
      if (webview) {
        webview.addEventListener('did-start-loading', () => {
          this.status = 'Loading...'
          console.log('WebView started loading')
        })
        
        webview.addEventListener('did-finish-load', () => {
          this.status = 'Loaded'
          console.log('WebView finished loading')
        })
        
        webview.addEventListener('did-fail-load', (e) => {
          this.status = `Failed: ${e.errorDescription}`
          console.error('WebView failed to load:', e)
        })
        
        webview.addEventListener('console-message', (e) => {
          console.log('WebView Console:', e.message)
        })

        webview.addEventListener('plugin-crashed', (e) => {
          this.status = 'Plugin crashed!'
          console.error('Plugin crashed:', e)
        })
      }
    })
  },
  methods: {
    loadUrl() {
      if (this.testUrl) {
        this.currentUrl = this.testUrl
        this.status = 'Loading URL...'
      }
    },
    loadGameUrl() {
      // Get game data from API or use test data
      const swfUrl = encodeURIComponent(this.gameSwfUrl)
      const vars = encodeURIComponent('editby=Trminhpc')
      
      // Load through HTML wrapper
      this.testUrl = `http://localhost:5173/flash-loader.html?swf=${swfUrl}&vars=${vars}`
      this.loadUrl()
    },
    checkPlugins() {
      const webview = this.$refs.webview
      if (webview) {
        webview.executeJavaScript(`
          (function() {
            const pluginsList = [];
            for (let i = 0; i < navigator.plugins.length; i++) {
              pluginsList.push({
                name: navigator.plugins[i].name,
                description: navigator.plugins[i].description
              });
            }
            return pluginsList;
          })();
        `).then(plugins => {
          console.log('WebView Plugins:', plugins)
          alert('Plugins found: ' + plugins.length + '\\n' + JSON.stringify(plugins, null, 2))
        }).catch(err => {
          console.error('Error checking plugins:', err)
        })
      }
    },
    reload() {
      const webview = this.$refs.webview
      if (webview) {
        webview.reload()
        this.status = 'Reloading...'
      }
    },
    openDevTools() {
      const webview = this.$refs.webview
      if (webview) {
        webview.openDevTools()
      }
    }
  }
}
</script>

<style scoped>
.webview-container {
  padding: 20px;
  background: #1a1a1a;
  color: white;
  min-height: 100vh;
}

h1 {
  color: #4CAF50;
  margin-bottom: 10px;
}

.info {
  color: #888;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.url-input {
  flex: 1;
  min-width: 300px;
  padding: 10px;
  border: 1px solid #4CAF50;
  border-radius: 5px;
  background: #2a2a2a;
  color: white;
  font-size: 14px;
}

.url-input:focus {
  outline: none;
  border-color: #66BB6A;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-load {
  background: #4CAF50;
  color: white;
}

.btn-load:hover {
  background: #45a049;
}

.btn-game {
  background: #2196F3;
  color: white;
}

.btn-game:hover {
  background: #0b7dda;
}

.btn-check {
  background: #FF9800;
  color: white;
}

.btn-check:hover {
  background: #e68900;
}

.btn-reload {
  background: #9C27B0;
  color: white;
}

.btn-reload:hover {
  background: #7B1FA2;
}

.btn-devtools {
  background: #607D8B;
  color: white;
}

.btn-devtools:hover {
  background: #455A64;
}

.webview-wrapper {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.debug-info {
  background: #2a2a2a;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #4CAF50;
}

.debug-info h3 {
  color: #4CAF50;
  margin-bottom: 10px;
}

.debug-info p {
  margin: 5px 0;
  font-family: monospace;
  font-size: 12px;
}

.debug-info button {
  margin-top: 10px;
  margin-right: 10px;
}
</style>
