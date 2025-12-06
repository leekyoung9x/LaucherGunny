<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <Toaster position="top-right" :duration="3000" rich-colors />
    
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
            <label for="userName" class="text-sm font-medium">Tên đăng nhập</label>
            <input
              id="userName"
              v-model="credentials.userName"
              type="text"
              placeholder="Nhập tên đăng nhập"
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

          <Button 
            type="submit" 
            class="w-full" 
            :disabled="loading"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/endpoints'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { Toaster } from '@/components/ui/sonner'

export default {
  name: 'Login',
  components: {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    Toaster,
    Loader2
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const credentials = ref({
      userName: '',
      password: ''
    })
    
    const loading = ref(false)

    const handleLogin = async () => {
      loading.value = true

      try {
        const response = await authApi.login(credentials.value)
        
        // Kiểm tra response success
        if (response.success) {
          // Lưu thông tin auth
          authStore.user = { 
            userName: credentials.value.userName,
            userId: response.userId
          }
          authStore.isAuthenticated = true
          authStore.token = response.token
          authStore.refreshToken = response.refreshToken
          
          // Lưu vào localStorage
          localStorage.setItem('token', response.token)
          localStorage.setItem('refreshToken', response.refreshToken)
          localStorage.setItem('userId', response.userId)

          // Hiển thị thông báo thành công
          toast.success(response.message || 'Đăng nhập thành công!')

          // Notify Electron to open main window
          if (window.electronAPI) {
            window.electronAPI.loginSuccess()
          } else {
            // For web/dev mode, navigate to home
            router.push('/')
          }
        } else {
          // Hiển thị lỗi từ server
          toast.error(response.message || 'Đăng nhập thất bại!')
        }
      } catch (err) {
        console.error('Login error:', err)
        
        // Xử lý các loại lỗi khác nhau
        if (err.response) {
          // Lỗi từ server
          const errorMessage = err.response.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng'
          toast.error(errorMessage)
        } else if (err.request) {
          // Lỗi network
          toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
        } else {
          // Lỗi khác
          toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
        }
      } finally {
        loading.value = false
      }
    }

    return {
      credentials,
      loading,
      handleLogin
    }
  }
}
</script>
