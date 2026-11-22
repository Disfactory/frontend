<script setup lang="ts">
import { AlertCircle, X } from '@lucide/vue'

defineProps<{
  alert: { title: string; dismissText: string } | null
  dismiss?: () => void
}>()
</script>

<template>
  <div
    v-if="alert"
    class="fixed inset-x-0 bottom-0 z-[80] flex items-start gap-4 bg-black/85 px-6 pt-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white"
  >
    <AlertCircle class="mt-0.5 size-6 shrink-0 text-white" />
    <div class="min-w-0 flex-1">
      <p class="text-lg leading-tight font-medium whitespace-pre-line">{{ alert.title }}</p>
      <p class="mt-1 text-xs text-white/80">{{ alert.dismissText }}</p>
    </div>
    <button
      type="button"
      class="rounded p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
      aria-label="關閉提示"
      @click="dismiss"
    >
      <X class="size-5" />
    </button>
  </div>
</template>
