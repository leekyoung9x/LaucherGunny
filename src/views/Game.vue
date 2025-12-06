<template>
  <div class="game-container">
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Đang tải game...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <h2>Lỗi</h2>
      <p>{{ error }}</p>
      <button @click="$router.push('/')" class="back-button">Quay lại trang chủ</button>
    </div>

    <!-- Game content -->
    <div v-else class="game-wrapper">
      <div id="flash-container"></div>
    </div>
  </div>
</template>

<script>
import { authApi } from '../api/endpoints'

export default {
  name: 'Game',
  data() {
    return {
      gameData: null,
      isLoading: true,
      error: null
    }
  },
  async mounted() {
    try {
      // Call login-game API first
      const response = await authApi.loginGame()
      
      if (response.success) {
        this.gameData = response
        // Load required scripts after getting game data
        this.loadScripts()
      } else {
        this.error = response.message || 'Không thể đăng nhập vào game'
        this.isLoading = false
      }
    } catch (err) {
      this.error = err.message || 'Lỗi khi kết nối tới server'
      this.isLoading = false
      console.error('Login game error:', err)
    }
  },
  methods: {
    loadScripts() {
      // Load scripts dynamically
      const scripts = [
        '/src/libgn/jquery.js',
        '/src/libgn/dandantang.js',
        '/src/libgn/rightClick.js',
        '/src/libgn/swfobject.js',
        '/src/libgn/isSafeFlash.js'
      ]

      this.loadScriptsSequentially(scripts, 0, () => {
        // Turn off loading before initializing game
        this.isLoading = false
        // Wait for DOM update then initialize game
        this.$nextTick(() => {
          this.initializeGame()
        })
      })
    },
    loadScriptsSequentially(scripts, index, callback) {
      if (index >= scripts.length) {
        callback()
        return
      }

      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = scripts[index]
      script.onload = () => {
        this.loadScriptsSequentially(scripts, index + 1, callback)
      }
      script.onerror = () => {
        console.error(`Failed to load script: ${scripts[index]}`)
        this.loadScriptsSequentially(scripts, index + 1, callback)
      }
      document.head.appendChild(script)
    },
    initializeGame() {
      if (!this.gameData || !this.gameData.redirectUrl) {
        console.error('Game data not available')
        return
      }

      // Use $nextTick to ensure DOM is ready
      this.$nextTick(() => {
        // Get redirectUrl and autoParam from API response
        const { redirectUrl, autoParam } = this.gameData

        // Create Flash object
        const flashContainer = document.getElementById('flash-container')
        
        if (!flashContainer) {
          console.error('Flash container not found in DOM')
          return
        }
        
        const flashHTML = `
          <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" 
                  id="7road-ddt-game"
                  codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0"
                  name="Main" 
                  width="1000" 
                  height="600" 
                  align="middle">
            <param name="allowScriptAccess" value="always" />
            <param name="movie" value="${redirectUrl}" />
            <param name="quality" value="high" />
            <param name="menu" value="false" />
            <param name="bgcolor" value="#000000" />
            <param name="FlashVars" value="${autoParam}" />
            <param name="wmode" value="direct" />
            <embed flashvars="${autoParam}" 
                   src="${redirectUrl}"
                   width="1000" 
                   height="600" 
                   align="middle" 
                   quality="high" 
                   name="Main" 
                   allowscriptaccess="always"
                   wmode="direct"
                   type="application/x-shockwave-flash" 
                   pluginspage="http://www.macromedia.com/go/getflashplayer" />
          </object>
        `
        
        flashContainer.innerHTML = flashHTML
        
        console.log('Flash initialized with URL:', redirectUrl)
        console.log('Flash params:', autoParam)
      })
    }
  },
  beforeUnmount() {
    // Clean up Flash object when leaving the view
    const flashContainer = document.getElementById('flash-container')
    if (flashContainer) {
      flashContainer.innerHTML = ''
    }
  }
}
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-image: url('/images/bg_all.jpg');
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.game-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

#flash-container {
  width: 1000px;
  height: 600px;
}

.loading-container,
.error-container {
  text-align: center;
  color: white;
}

.loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container h2 {
  color: #ff4444;
  margin-bottom: 10px;
}

.error-container p {
  margin-bottom: 20px;
}

.back-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.back-button:hover {
  background-color: #45a049;
}
</style>
