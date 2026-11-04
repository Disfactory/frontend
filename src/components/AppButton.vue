<script setup lang="ts">
import { Button } from '@/components/ui/button'

withDefaults(
  defineProps<{
    outline?: boolean
    disabled?: boolean
    small?: boolean
    auto?: boolean
    color?: string
    type?: 'button' | 'submit'
  }>(),
  {
    outline: false,
    disabled: false,
    small: false,
    auto: false,
    color: 'default',
    type: 'button',
  },
)

defineEmits<{ click: [MouseEvent] }>()
</script>

<template>
  <Button
    :variant="outline ? 'outline' : 'default'"
    :size="small ? 'sm' : 'lg'"
    :disabled="disabled"
    :type="type"
    :class="[
      'rounded-full border font-medium shadow-sm',
      auto ? 'w-auto' : 'w-full',
      outline ? 'border-brand bg-white text-brand hover:bg-brand hover:text-white' : '',
      !outline && color === 'dark-green' ? 'border-brand-dark bg-brand-dark hover:bg-brand-dark/90' : '',
      !outline && color === 'white' ? 'border-white bg-white text-brand-dark hover:bg-white/90' : '',
      small ? 'h-8 px-3 text-xs' : 'h-11 px-6 text-base',
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </Button>
</template>
