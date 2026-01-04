<template>
  <DropdownMenu v-model:open="isMenuOpen">
    <DropdownMenuTrigger as-child>
      <button class="inline-flex items-center justify-center p-1 rounded-full hover:bg-accent transition-colors outline-none data-[state=open]:bg-accent cursor-pointer">
        <!-- Avatar -->
        <Avatar class="h-8 w-8">
          <AvatarImage :src="avatarUrl" :alt="userName" />
          <AvatarFallback class="bg-primary text-primary-foreground text-xs">
            {{ userInitials }}
          </AvatarFallback>
        </Avatar>
      </button>
    </DropdownMenuTrigger>
    
    <DropdownMenuContent align="end" class="w-64">
      <!-- User Info -->
      <DropdownMenuLabel class="font-normal">
        <div class="flex flex-col space-y-1">
          <p class="text-sm font-medium leading-none">{{ userFullName || userName }}</p>
          <p class="text-xs leading-none text-muted-foreground">{{ userEmail }}</p>
        </div>
      </DropdownMenuLabel>
      
      <DropdownMenuSeparator />
      
      <!-- Balance with Refresh -->
      <div class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
        <Wallet class="mr-2 h-4 w-4" />
        <span class="flex-1">Số dư: {{ formattedMoney }}</span>
        <button 
          @click.stop="handleRefreshBalance"
          class="hover:bg-accent-foreground/10 rounded p-1 transition-colors"
          title="Làm mới số dư"
        >
          <RefreshCw :class="['h-4 w-4 text-muted-foreground', { 'animate-spin': refreshing }]" />
        </button>
      </div>
      
      <!-- Transfer Money -->
      <DropdownMenuItem @click="openTransferDialog" class="cursor-pointer">
        <ArrowLeftRight class="mr-2 h-4 w-4" />
        <span>Chuyển tiền vào game</span>
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      
      <!-- Account Settings -->
      <DropdownMenuItem class="cursor-pointer">
        <User class="mr-2 h-4 w-4" />
        <span>Thông tin tài khoản</span>
      </DropdownMenuItem>
      
      <DropdownMenuItem class="cursor-pointer">
        <Settings class="mr-2 h-4 w-4" />
        <span>Cài đặt</span>
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      
      <!-- Logout -->
      <DropdownMenuItem @click="handleLogout" class="cursor-pointer text-destructive focus:text-destructive">
        <LogOut class="mr-2 h-4 w-4" />
        <span>Đăng xuất</span>
      </DropdownMenuItem>
    </DropdownMenuContent>

    <!-- Transfer Dialog -->
    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chuyển tiền vào game</DialogTitle>
          <DialogDescription>
            Chuyển tiền từ web vào game để sử dụng trong trò chơi
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4 py-4">
          <!-- Current Balance -->
          <div class="flex items-center justify-between p-3 rounded-lg bg-muted">
            <span class="text-sm text-muted-foreground">Số dư hiện tại:</span>
            <span class="font-semibold">{{ formattedMoney }}</span>
          </div>
          
          <!-- Transfer Amount Input -->
          <div class="space-y-2">
            <label for="amount" class="text-sm font-medium">Số tiền muốn chuyển:</label>
            <input
              id="amount"
              v-model.number="transferAmount"
              type="number"
              min="0"
              :max="userMoney"
              placeholder="Nhập số tiền"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          
          <!-- Quick Amount Buttons -->
          <div class="grid grid-cols-4 gap-2">
            <Button 
              v-for="amount in quickAmounts" 
              :key="amount"
              @click="transferAmount = amount"
              variant="outline"
              size="sm"
            >
              {{ formatMoney(amount) }}
            </Button>
          </div>
          
          <!-- Warning -->
          <div v-if="transferAmount > userMoney" class="text-sm text-destructive">
            Số tiền chuyển không được vượt quá số dư hiện tại
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            @click="handleTransfer" 
            :disabled="!transferAmount || transferAmount <= 0 || transferAmount > userMoney || loading"
            class="w-full"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ loading ? 'Đang xử lý...' : 'Xác nhận chuyển tiền' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </DropdownMenu>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/endpoints'
import { toast } from 'vue-sonner'
import { 
  Coins, 
  ArrowLeftRight, 
  Loader2, 
  RefreshCw, 
  User,
  Wallet,
  Settings,
  LogOut
} from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Dialog from '@/components/ui/Dialog.vue'
import DialogContent from '@/components/ui/DialogContent.vue'
import DialogDescription from '@/components/ui/DialogDescription.vue'
import DialogFooter from '@/components/ui/DialogFooter.vue'
import DialogHeader from '@/components/ui/DialogHeader.vue'
import DialogTitle from '@/components/ui/DialogTitle.vue'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import DropdownMenuContent from '@/components/ui/DropdownMenuContent.vue'
import DropdownMenuItem from '@/components/ui/DropdownMenuItem.vue'
import DropdownMenuLabel from '@/components/ui/DropdownMenuLabel.vue'
import DropdownMenuSeparator from '@/components/ui/DropdownMenuSeparator.vue'
import DropdownMenuTrigger from '@/components/ui/DropdownMenuTrigger.vue'
import Avatar from '@/components/ui/Avatar.vue'
import AvatarImage from '@/components/ui/AvatarImage.vue'
import AvatarFallback from '@/components/ui/AvatarFallback.vue'

const router = useRouter()
const authStore = useAuthStore()

const isDialogOpen = ref(false)
const isMenuOpen = ref(false)
const transferAmount = ref(0)
const loading = ref(false)
const refreshing = ref(false)

const userMoney = computed(() => authStore.userMoney)
const userName = computed(() => authStore.userName)
const userFullName = computed(() => authStore.userFullName)
const userEmail = computed(() => authStore.currentUser?.email || '')
const formattedMoney = computed(() => formatMoney(userMoney.value))

// Generate avatar URL (you can customize this)
const avatarUrl = computed(() => {
  // Use a placeholder avatar service or custom logic
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(userFullName.value || userName.value)}&background=0D8ABC&color=fff`
})

// Get user initials for fallback
const userInitials = computed(() => {
  const name = userFullName.value || userName.value
  if (!name) return '?'
  
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const quickAmounts = [100, 500, 1000, 5000]

const formatMoney = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

const handleRefreshBalance = async () => {
  if (refreshing.value) return
  
  refreshing.value = true
  try {
    await authStore.fetchUserInfo()
    toast.success('Đã cập nhật số dư!')
    // Giữ menu mở
    isMenuOpen.value = true
  } catch (error) {
    console.error('Refresh balance error:', error)
    toast.error('Không thể cập nhật số dư')
  } finally {
    refreshing.value = false
  }
}

const openTransferDialog = () => {
  isDialogOpen.value = true
  transferAmount.value = 0
}

const handleTransfer = async () => {
  if (!transferAmount.value || transferAmount.value <= 0 || transferAmount.value > userMoney.value) {
    toast.error('Số tiền không hợp lệ')
    return
  }

  loading.value = true

  try {
    await authApi.transferMoney({ amount: transferAmount.value })
    await authStore.fetchUserInfo()
    
    toast.success(`Đã chuyển ${formatMoney(transferAmount.value)} vào game thành công!`)
    isDialogOpen.value = false
    transferAmount.value = 0
  } catch (error) {
    console.error('Transfer error:', error)
    const errorMessage = error.response?.data?.message || 'Chuyển tiền thất bại. Vui lòng thử lại.'
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
  
  if (window.electronAPI) {
    window.electronAPI.logout()
  }
}
</script>
