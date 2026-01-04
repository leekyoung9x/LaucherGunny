<script setup>
import { AvatarImage } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  src: { type: String },
  asChild: { type: Boolean },
  as: { type: null },
  class: { type: null },
})
</script>

<template>
  <AvatarImage
    v-bind="props"
    :class="cn('aspect-square h-full w-full', props.class)"
  />
</template>
