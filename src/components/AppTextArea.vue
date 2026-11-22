<script setup lang="ts">
import { Textarea } from '@/components/ui/textarea'

withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    class?: string
    rows?: number
  }>(),
  {
    modelValue: '',
    placeholder: '',
    class: '',
    rows: 5,
  },
)

defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <Textarea
    :model-value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :class="[
      'min-h-[140px] rounded border-brand-light bg-white text-base text-black placeholder:text-[#bababa] focus-visible:border-brand focus-visible:ring-brand/30',
      $props.class,
    ]"
    @update:model-value="$emit('update:modelValue', String($event))"
  />
</template>
