<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold text-center">Welcome Back</CardTitle>
        <CardDescription class="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium">Email</label>
            <input
              id="email"
              v-model="credentials.email"
              type="email"
              placeholder="name@example.com"
              required
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium">Password</label>
            <input
              id="password"
              v-model="credentials.password"
              type="password"
              placeholder="••••••••"
              required
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div v-if="error" class="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {{ error }}
          </div>

          <Button 
            type="submit" 
            class="w-full" 
            :disabled="loading"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </Button>
        </form>

        <div class="mt-4 text-center text-sm text-muted-foreground">
          <p>Demo: Use any email/password to login</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'

export default {
  name: 'Login',
  components: {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const credentials = ref({
      email: '',
      password: ''
    })
    
    const loading = ref(false)
    const error = ref(null)

    const handleLogin = async () => {
      loading.value = true
      error.value = null

      try {
        // For demo: simulate successful login
        // In production, use: await authStore.login(credentials.value)
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Store auth state
        authStore.user = { email: credentials.value.email, name: 'Demo User' }
        authStore.isAuthenticated = true
        authStore.token = 'demo-token'
        localStorage.setItem('token', 'demo-token')

        // Notify Electron to open main window
        if (window.electronAPI) {
          window.electronAPI.loginSuccess()
        } else {
          // For web/dev mode, navigate to home
          router.push('/')
        }
      } catch (err) {
        error.value = err.response?.data?.message || 'Login failed. Please try again.'
      } finally {
        loading.value = false
      }
    }

    return {
      credentials,
      loading,
      error,
      handleLogin
    }
  }
}
</script>
