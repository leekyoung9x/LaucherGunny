<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <Toaster position="top-right" :duration="3000" rich-colors />
    
    <!-- Language Switcher -->
    <div class="absolute top-4 right-4">
      <div class="flex gap-2">
        <button
          v-for="lang in languages"
          :key="lang.code"
          @click="changeLanguage(lang.code)"
          :class="[
            'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            currentLocale === lang.code 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-white/80 hover:bg-white shadow-sm'
          ]"
        >
          <span class="text-base">{{ lang.flag }}</span>
          <span class="text-xs">{{ lang.label }}</span>
        </button>
      </div>
    </div>
    
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold text-center">{{ t('auth.welcomeBack') }}</CardTitle>
        <CardDescription class="text-center">
          {{ t('auth.enterCredentials') }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <label for="userName" class="text-sm font-medium">{{ t('auth.username') }}</label>
            <input
              id="userName"
              v-model="credentials.userName"
              type="text"
              :placeholder="t('auth.enterUsername')"
              required
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium">{{ t('auth.password') }}</label>
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
            {{ loading ? t('auth.loggingIn') : t('auth.login') }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
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
    const { t, locale } = useI18n()
    
    // Language settings
    const languages = [
      { code: 'vi', label: 'VN', flag: '🇻🇳', name: 'Tiếng Việt' },
      { code: 'en', label: 'EN', flag: '🇺🇸', name: 'English' },
    ]
    
    const currentLocale = computed(() => locale.value)
    
    const changeLanguage = (lang) => {
      locale.value = lang
      localStorage.setItem('locale', lang)
    }
    
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
          authStore.isAuthenticated = true
          authStore.token = response.token
          authStore.refreshToken = response.refreshToken
          
          // Lưu vào localStorage
          localStorage.setItem('token', response.token)
          localStorage.setItem('refreshToken', response.refreshToken)
          localStorage.setItem('userId', response.userId)

          // Lấy thông tin người dùng
          try {
            await authStore.fetchUserInfo()
          } catch (err) {
            console.error('Failed to fetch user info:', err)
          }

          // Hiển thị thông báo thành công
          toast.success(response.message || t('auth.loginSuccess'))

          // Notify Electron to open main window
          if (window.electronAPI) {
            window.electronAPI.loginSuccess()
          } else {
            // For web/dev mode, navigate to home
            router.push('/')
          }
        } else {
          // Hiển thị lỗi từ server
          toast.error(response.message || t('auth.loginError'))
        }
      } catch (err) {
        console.error('Login error:', err)
        
        // Xử lý các loại lỗi khác nhau
        if (err.response) {
          // Lỗi từ server
          const errorMessage = err.response.data?.message || t('auth.invalidCredentials')
          toast.error(errorMessage)
        } else if (err.request) {
          // Lỗi network
          toast.error(t('auth.connectionError'))
        } else {
          // Lỗi khác
          toast.error(t('auth.errorOccurred'))
        }
      } finally {
        loading.value = false
      }
    }

    return {
      credentials,
      loading,
      handleLogin,
      t,
      languages,
      currentLocale,
      changeLanguage
    }
  }
}
</script>
