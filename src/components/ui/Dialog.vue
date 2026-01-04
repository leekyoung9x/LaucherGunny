<script setup>
import { computed } from 'vue'
import {
  DialogRoot,
  DialogTrigger,
  useForwardPropsEmits,
} from 'radix-vue'

const props = defineProps({
  open: { type: Boolean, default: undefined },
  defaultOpen: { type: Boolean },
  modal: { type: Boolean, default: true },
})

const emits = defineEmits(['update:open'])

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DialogRoot v-bind="forwarded">
    <slot />
  </DialogRoot>
</template>
