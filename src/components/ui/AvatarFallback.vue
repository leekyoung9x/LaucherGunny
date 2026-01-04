<script setup>
import { AvatarFallback } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  delayMs: { type: Number },
  asChild: { type: Boolean },
  as: { type: null },
  class: { type: null },
})
</script>

<template>
  <AvatarFallback
    v-bind="props"
    :class="
      cn('flex h-full w-full items-center justify-center rounded-full bg-muted', props.class)
    "
  >
    <slot />
  </AvatarFallback>
</template>
