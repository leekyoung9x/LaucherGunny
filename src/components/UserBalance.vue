<template>
  <div class="flex items-center gap-4">
    <!-- User Balance Display -->
    <div class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 shadow-md">
      <Coins class="w-5 h-5 text-white" />
      <span class="font-semibold text-white">
        {{ formattedMoney }}
      </span>
    </div>
    
    <!-- Transfer Money Button -->
    <Button 
      @click="openTransferDialog" 
      variant="outline"
      class="flex items-center gap-2"
    >
      <ArrowLeftRight class="w-4 h-4" />
      Chuyển tiền vào game
    </Button>

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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/endpoints'
import { toast } from 'vue-sonner'
import { Coins, ArrowLeftRight, Loader2 } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Dialog from '@/components/ui/Dialog.vue'
import DialogContent from '@/components/ui/DialogContent.vue'
import DialogDescription from '@/components/ui/DialogDescription.vue'
import DialogFooter from '@/components/ui/DialogFooter.vue'
import DialogHeader from '@/components/ui/DialogHeader.vue'
import DialogTitle from '@/components/ui/DialogTitle.vue'

const authStore = useAuthStore()

const isDialogOpen = ref(false)
const transferAmount = ref(0)
const loading = ref(false)

const userMoney = computed(() => authStore.userMoney)
const formattedMoney = computed(() => formatMoney(userMoney.value))

const quickAmounts = [100, 500, 1000, 5000]

const formatMoney = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount)
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
    // Call API to transfer money
    await authApi.transferMoney({ amount: transferAmount.value })
    
    // Refresh user info after transfer
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
</script>
