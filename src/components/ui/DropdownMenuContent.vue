<script setup>
import { computed } from 'vue'
import { DropdownMenuContent, DropdownMenuPortal, useForwardPropsEmits } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  forceMount: { type: Boolean },
  loop: { type: Boolean },
  side: { type: String, default: 'bottom' },
  sideOffset: { type: Number, default: 4 },
  align: { type: String, default: 'center' },
  alignOffset: { type: Number },
  avoidCollisions: { type: Boolean },
  collisionBoundary: { type: null },
  collisionPadding: { type: [Number, Object] },
  arrowPadding: { type: Number },
  sticky: { type: String },
  hideWhenDetached: { type: Boolean },
  updatePositionStrategy: { type: String },
  prioritizePosition: { type: Boolean },
  asChild: { type: Boolean },
  as: { type: null },
  class: { type: null },
})

const emits = defineEmits([
  'escapeKeyDown',
  'pointerDownOutside',
  'focusOutside',
  'interactOutside',
  'closeAutoFocus',
])

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      v-bind="forwarded"
      :class="
        cn(
          'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          props.class,
        )
      "
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
