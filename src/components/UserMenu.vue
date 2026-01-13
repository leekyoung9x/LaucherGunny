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
        <span class="flex-1">{{ t('user.balance') }}: {{ formattedMoney }}</span>
        <button 
          @click.stop="handleRefreshBalance"
          class="hover:bg-accent-foreground/10 rounded p-1 transition-colors"
          :title="t('user.refreshBalance')"
        >
          <RefreshCw :class="['h-4 w-4 text-muted-foreground', { 'animate-spin': refreshing }]" />
        </button>
      </div>
      
      <!-- Deposit Money -->
      <DropdownMenuItem @click="openDepositDialog" class="cursor-pointer">
        <CreditCard class="mr-2 h-4 w-4" />
        <span>{{ t('deposit.title') || 'Nạp tiền' }}</span>
      </DropdownMenuItem>
      
      <!-- Transfer Money -->
      <DropdownMenuItem @click="openTransferDialog" class="cursor-pointer">
        <ArrowLeftRight class="mr-2 h-4 w-4" />
        <span>{{ t('transfer.title') }}</span>
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      
      <!-- Account Settings -->
      <DropdownMenuItem class="cursor-pointer">
        <User class="mr-2 h-4 w-4" />
        <span>{{ t('user.profile') }}</span>
      </DropdownMenuItem>
      
      <DropdownMenuItem class="cursor-pointer">
        <Settings class="mr-2 h-4 w-4" />
        <span>{{ t('user.settings') }}</span>
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      
      <!-- Logout -->
      <DropdownMenuItem @click="handleLogout" class="cursor-pointer text-destructive focus:text-destructive">
        <LogOut class="mr-2 h-4 w-4" />
        <span>{{ t('auth.logout') }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>

    <!-- Transfer Dialog -->
    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t('transfer.title') }}</DialogTitle>
          <DialogDescription>
            {{ t('transfer.description') }}
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4 py-4">
          <!-- Current Balance -->
          <div class="flex items-center justify-between p-3 rounded-lg bg-muted">
            <span class="text-sm text-muted-foreground">{{ t('user.currentBalance') }}:</span>
            <span class="font-semibold">{{ formattedMoney }}</span>
          </div>
          
          <!-- Transfer Amount Input -->
          <div class="space-y-2">
            <label for="amount" class="text-sm font-medium">{{ t('transfer.amount') }}:</label>
            <input
              id="amount"
              v-model.number="transferAmount"
              type="number"
              min="0"
              :max="userMoney"
              :placeholder="t('transfer.enterAmount')"
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
            {{ t('transfer.amountExceedsBalance') }}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            @click="handleTransfer" 
            :disabled="!transferAmount || transferAmount <= 0 || transferAmount > userMoney || loading"
            class="w-full"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ loading ? t('common.processing') : t('transfer.confirmTransfer') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Result Dialog -->
    <Dialog v-model:open="isResultDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle :class="resultData.success ? 'text-green-600' : 'text-red-600'">
            {{ resultData.success ? `✅ ${t('transfer.transferSuccess')}` : `❌ ${t('transfer.transferFailed')}` }}
          </DialogTitle>
        </DialogHeader>
        
        <div class="space-y-4 py-4">
          <div v-if="resultData.success" class="space-y-3">
            <div class="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
              <span class="text-sm font-medium text-green-800">{{ t('transfer.remainingBalance') }}:</span>
              <span class="font-bold text-green-600">{{ formatMoney(resultData.remainingMemberMoney) }}</span>
            </div>
          </div>
          <div v-else class="p-4 rounded-lg bg-red-50 border border-red-200">
            <p class="text-sm text-red-800">{{ resultData.message }}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button @click="isResultDialogOpen = false" class="w-full">
            {{ t('common.close') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Deposit Dialog -->
    <Dialog v-model:open="isDepositDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t('deposit.title') || 'Nạp tiền' }}</DialogTitle>
          <DialogDescription>
            {{ t('deposit.description') || 'Chọn số tiền bạn muốn nạp vào tài khoản' }}
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4 py-4">
          <!-- Current Balance -->
          <div class="flex items-center justify-between p-3 rounded-lg bg-muted">
            <span class="text-sm text-muted-foreground">{{ t('user.currentBalance') }}:</span>
            <span class="font-semibold">{{ formattedMoney }}</span>
          </div>
          
          <!-- Deposit Amount Input -->
          <div class="space-y-2">
            <label for="depositAmount" class="text-sm font-medium">{{ t('deposit.amount') || 'Số tiền' }}:</label>
            <input
              id="depositAmount"
              v-model.number="depositAmount"
              type="number"
              min="0"
              :placeholder="t('deposit.enterAmount') || 'Nhập số tiền'"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          
          <!-- Quick Amount Buttons for Deposit -->
          <div class="grid grid-cols-3 gap-2">
            <Button 
              v-for="amount in depositQuickAmounts" 
              :key="amount"
              @click="depositAmount = amount"
              variant="outline"
              size="sm"
            >
              {{ formatMoney(amount) }}đ
            </Button>
          </div>
          
          <!-- Warning -->
          <div v-if="depositAmount && depositAmount < 50000" class="text-sm text-destructive">
            {{ t('deposit.minAmount') || 'Số tiền tối thiểu là 50,000đ' }}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            @click="handleDeposit" 
            :disabled="!depositAmount || depositAmount < 50000 || depositLoading"
            class="w-full"
          >
            <Loader2 v-if="depositLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ depositLoading ? t('common.processing') : (t('deposit.confirmDeposit') || 'Xác nhận nạp tiền') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Payment Popup (Full Screen) -->
    <Dialog v-model:open="isPaymentPopupOpen">
      <DialogContent class="!max-w-none !h-screen !w-screen !p-0 !m-0 !gap-0 !translate-x-[-50%] !translate-y-[-50%] !border-0 !rounded-none [&>button]:hidden">
        <!-- Custom Close Button -->
        <div class="absolute top-4 right-4 z-50">
          <Button 
            @click="closePaymentPopup" 
            variant="ghost" 
            size="sm"
            class="h-10 w-10 p-0 bg-white/95 hover:bg-white shadow-lg rounded-full font-bold text-lg"
          >
            ✕
          </Button>
        </div>
        
        <!-- Full iframe -->
        <iframe 
          v-if="paymentUrl"
          :src="paymentUrl" 
          class="w-full h-full border-0"
          allow="payment"
        />
      </DialogContent>
    </Dialog>
  </DropdownMenu>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { authApi, paymentApi } from '@/api/endpoints'
import { toast } from 'vue-sonner'
import { 
  Coins, 
  ArrowLeftRight, 
  Loader2, 
  RefreshCw, 
  User,
  Wallet,
  Settings,
  LogOut,
  CreditCard
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

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const isDialogOpen = ref(false)
const isResultDialogOpen = ref(false)
const isDepositDialogOpen = ref(false)
const isPaymentPopupOpen = ref(false)
const isMenuOpen = ref(false)
const transferAmount = ref(0)
const depositAmount = ref(0)
const loading = ref(false)
const depositLoading = ref(false)
const refreshing = ref(false)
const paymentUrl = ref('')
const resultData = ref({
  success: false,
  message: '',
  remainingMemberMoney: 0,
  tankMoney: 0
})

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
const depositQuickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000]

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
    const data = await authApi.transferMoney({ amount: transferAmount.value })
    
    // Store result data
    resultData.value = {
      success: data.success,
      message: data.message || '',
      remainingMemberMoney: data.remainingMemberMoney || 0,
      tankMoney: data.tankMoney || 0
    }
    
    // Close transfer dialog and show result dialog
    isDialogOpen.value = false
    transferAmount.value = 0
    isResultDialogOpen.value = true
    
    // Refresh user info if success
    if (data.success) {
      await authStore.fetchUserInfo()
    }
  } catch (error) {
    console.error('Transfer error:', error)
    const errorMessage = error.response?.data?.message || 'Chuyển tiền thất bại. Vui lòng thử lại.'
    
    // Show error in result dialog
    resultData.value = {
      success: false,
      message: errorMessage,
      remainingMemberMoney: 0,
      tankMoney: 0
    }
    
    isDialogOpen.value = false
    isResultDialogOpen.value = true
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

const openDepositDialog = () => {
  isDepositDialogOpen.value = true
  depositAmount.value = 0
}

const handleDeposit = async () => {
  if (!depositAmount.value || depositAmount.value < 50000) {
    toast.error('Số tiền không hợp lệ. Tối thiểu 50,000đ')
    return
  }

  depositLoading.value = true

  try {
    const data = await paymentApi.createCheckoutSession({
      amount: depositAmount.value,
      description: `Nạp tiền vào tài khoản #${userName.value}`,
      productName: 'Money Website',
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'
    })
    
    // Kiểm tra response
    if (data.checkoutUrl) {
      // Đóng deposit dialog
      isDepositDialogOpen.value = false
      
      // Mở payment popup với URL
      paymentUrl.value = data.checkoutUrl
      isPaymentPopupOpen.value = true
      
      toast.success('Đang chuyển đến trang thanh toán...')
    } else {
      toast.error('Không thể tạo phiên thanh toán')
    }
  } catch (error) {
    console.error('Deposit error:', error)
    const errorMessage = error.response?.data?.message || 'Không thể tạo phiên thanh toán. Vui lòng thử lại.'
    toast.error(errorMessage)
  } finally {
    depositLoading.value = false
  }
}

const closePaymentPopup = () => {
  isPaymentPopupOpen.value = false
  paymentUrl.value = ''
  depositAmount.value = 0
  
  // Refresh balance sau khi đóng popup
  handleRefreshBalance()
}
</script>
