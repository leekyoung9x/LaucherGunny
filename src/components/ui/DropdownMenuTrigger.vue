<script setup>
import { DropdownMenuTrigger } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  asChild: { type: Boolean, default: false },
  disabled: { type: Boolean },
  class: { type: null },
})
</script>

<template>
  <DropdownMenuTrigger
    v-bind="props"
    :class="cn('outline-none', props.class)"
  >
    <slot />
  </DropdownMenuTrigger>
</template>
