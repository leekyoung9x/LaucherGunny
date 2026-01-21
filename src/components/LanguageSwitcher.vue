<template>
  <div class="relative inline-block">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button class="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-md hover:bg-accent transition-colors outline-none cursor-pointer focus:ring-2 focus:ring-ring">
          <Globe class="w-4 h-4 flex-shrink-0" />
          <span class="flex-shrink-0">{{ currentLanguage.label }}</span>
          <ChevronDown class="w-3 h-3 flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" :sideOffset="8" class="w-44">
        <DropdownMenuItem
          v-for="lang in languages"
          :key="lang.code"
          @click="changeLanguage(lang.code)"
          :class="currentLocale === lang.code ? 'bg-accent' : ''"
        >
          <div class="flex items-center gap-2 w-full">
            <span class="text-base">{{ lang.flag }}</span>
            <span>{{ lang.name }}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
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
