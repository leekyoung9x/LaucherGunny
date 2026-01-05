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
      {{ t('transfer.title') }}
    </Button>

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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()
const authStore = useAuthStore()

const isDialogOpen = ref(false)
const isResultDialogOpen = ref(false)
const transferAmount = ref(0)
const loading = ref(false)
const resultData = ref({
  success: false,
  message: '',
  remainingMemberMoney: 0,
  tankMoney: 0
})

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
</script>
