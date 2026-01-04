<template>
  <div v-if="isLoginPage" class="min-h-screen">
    <router-view />
  </div>
  
  <div v-else class="min-h-screen">
    <!-- Navbar -->
    <nav class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16 flex items-center">
      <div class="max-w-screen-xl flex items-center justify-between mx-auto px-4 w-full">
        <router-link to="/" class="flex items-center space-x-3">
          <span class="self-center text-2xl font-semibold whitespace-nowrap">
            DDTank Legend
          </span>
        </router-link>
        <button 
          data-collapse-toggle="navbar-default" 
          type="button" 
          class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <span class="sr-only">Open main menu</span>
          <svg class="w-5 h-5" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
          </svg>
        </button>
        <div class="hidden w-full md:block md:w-auto" id="navbar-default">
          <div class="flex items-center gap-6">
            <!-- Navigation Menu -->
            <ul class="font-medium flex flex-row md:space-x-8">
              <li>
                <router-link 
                  to="/" 
                  class="block py-2 px-3 rounded hover:bg-accent md:hover:bg-transparent md:border-0 md:p-0"
                  active-class="text-primary"
                >
                  Home
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/game" 
                  class="block py-2 px-3 rounded hover:bg-accent md:hover:bg-transparent md:border-0 md:p-0"
                  active-class="text-primary"
                >
                  Play Game
                </router-link>
              </li>
            </ul>
            
            <!-- User Menu with Balance and Avatar -->
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>

    <!-- Router View -->
    <router-view />
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UserMenu from '@/components/UserMenu.vue'

export default {
  name: 'App',
  components: {
    UserMenu
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()

    // Check if already logged in on mount
    onMounted(async () => {
      const token = localStorage.getItem('token')
      if (token && window.electronAPI) {
        // User is already logged in, switch to main window
        authStore.isAuthenticated = true
        authStore.token = token
        
        // Fetch user info
        try {
          await authStore.fetchUserInfo()
        } catch (error) {
          console.error('Failed to fetch user info:', error)
        }
        
        window.electronAPI.showMainWindow()
      }
    })
    
    const isLoginPage = computed(() => route.path === '/login')
    
    return {
      isLoginPage
    }
  }
}
</script>
