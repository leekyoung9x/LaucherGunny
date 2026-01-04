<script setup>
import { DropdownMenuRoot } from 'radix-vue'

const props = defineProps({
  open: { type: Boolean, default: undefined },
  defaultOpen: { type: Boolean },
  modal: { type: Boolean, default: true },
})

const emits = defineEmits(['update:open'])
</script>

<template>
  <DropdownMenuRoot v-bind="props" @update:open="emits('update:open', $event)">
    <slot />
  </DropdownMenuRoot>
</template>
