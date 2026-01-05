<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors outline-none cursor-pointer">
        <Globe class="w-4 h-4" />
        <span>{{ currentLanguage.flag }}</span>
        <ChevronDown class="w-3 h-3" />
      </button>
    </DropdownMenuTrigger>
    
    <DropdownMenuContent align="end" class="w-40">
      <DropdownMenuItem
        v-for="lang in languages"
        :key="lang.code"
        @click="changeLanguage(lang.code)"
        :class="[
          'cursor-pointer',
          currentLocale === lang.code && 'bg-accent'
        ]"
      >
        <span class="mr-2">{{ lang.flag }}</span>
        <span>{{ lang.name }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Globe, ChevronDown } from 'lucide-vue-next'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import DropdownMenuContent from '@/components/ui/DropdownMenuContent.vue'
import DropdownMenuItem from '@/components/ui/DropdownMenuItem.vue'
import DropdownMenuTrigger from '@/components/ui/DropdownMenuTrigger.vue'

const { locale } = useI18n()

const languages = [
  { code: 'vi', label: 'VI', flag: '🇻🇳', name: 'Tiếng Việt' },
  { code: 'en', label: 'EN', flag: '🇺🇸', name: 'English' },
]

const currentLocale = computed(() => locale.value)
const currentLanguage = computed(() => 
  languages.find(lang => lang.code === currentLocale.value) || languages[0]
)

const changeLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
}
</script>
