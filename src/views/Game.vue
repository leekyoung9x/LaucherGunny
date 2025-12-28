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
      <webview 
        id="game-webview"
        :src="gameUrl"
        style="width: 1000px; height: 600px; border: none; background: #000;"
        allowpopups
        plugins
        webpreferences="allowRunningInsecureContent, plugins"
      ></webview>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { authApi } from '../api/endpoints'

export default {
  name: 'Game',
  data() {
    return {
      gameData: null,
      isLoading: true,
      error: null,
      gameUrl: ''
    }
  },
  async mounted() {
    try {
      // Call login-game API first
      const response = await authApi.loginGame()
      
      if (response.success) {
        let gameUrl = import.meta.env.VITE_GAME_BASE_URL

        this.gameData = response
        const { redirectUrl, autoParam } = response
        
        // Load full game page URL instead of just SWF
        this.gameUrl = `${gameUrl}/index.html?url=${encodeURIComponent(redirectUrl)}&auto=${encodeURIComponent(autoParam)}`
        this.isLoading = false
        
        console.log('Loading game page:', this.gameUrl)
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
  },
  beforeUnmount() {
  }
}
</script>

<style scoped>
.game-container {
  width: 100%;
  /* height: 100vh; */
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
