<template>
  <div v-if="isLoginPage" class="min-h-screen">
    <router-view />
  </div>
  
  <div v-else class="min-h-screen">
    <!-- Navbar -->
    <nav class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <router-link to="/" class="flex items-center space-x-3">
          <span class="self-center text-2xl font-semibold whitespace-nowrap">
            Electron + Vue 3
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
          <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 border rounded-lg md:flex-row md:space-x-8 md:mt-0 md:border-0">
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
                to="/about" 
                class="block py-2 px-3 rounded hover:bg-accent md:hover:bg-transparent md:border-0 md:p-0"
                active-class="text-primary"
              >
                About
              </router-link>
            </li>
            <li>
              <button 
                @click="handleLogout"
                class="block py-2 px-3 rounded hover:bg-accent md:hover:bg-transparent md:border-0 md:p-0 text-destructive"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Router View -->
    <router-view />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'App',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    
    const isLoginPage = computed(() => route.path === '/login')
    
    const handleLogout = () => {
      authStore.logout()
      
      // Notify Electron to show login window
      if (window.electronAPI) {
        window.electronAPI.logout()
      } else {
        router.push('/login')
      }
    }
    
    return {
      isLoginPage,
      handleLogout
    }
  }
}
</script>
