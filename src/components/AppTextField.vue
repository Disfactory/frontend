<script setup lang="ts">
import { Input } from '@/components/ui/input'

withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    type?: string
    class?: string
    small?: boolean
    disabled?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: '',
    type: 'text',
    class: '',
    small: false,
    disabled: false,
  },
)

defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <Input
    :model-value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="[
      'rounded border-brand-light bg-white text-base text-black placeholder:text-[#bababa] focus-visible:border-brand focus-visible:ring-brand/30',
      small ? 'h-9 text-sm' : 'h-11',
      $props.class,
    ]"
    @update:model-value="$emit('update:modelValue', String($event))"
  />
</template>
