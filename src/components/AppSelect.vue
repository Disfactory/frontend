<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'

defineProps<{
  modelValue?: string
  items: { text: string; value?: string }[]
  placeholder?: string
}>()

defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="relative w-full">
    <select
      :value="modelValue ?? ''"
      class="h-11 w-full appearance-none rounded border border-brand-light bg-white px-3 pr-9 text-base text-black outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="" disabled>{{ placeholder || '未選擇' }}</option>
      <option v-for="item in items" :key="item.value ?? item.text" :value="item.value">
        {{ item.text }}
      </option>
    </select>
    <ChevronDown
      class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-brand-dark"
    />
  </div>
</template>
