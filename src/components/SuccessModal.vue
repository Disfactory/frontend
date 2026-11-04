<script setup lang="ts">
import { CheckCircle2 } from '@lucide/vue'
import AppModal from './AppModal.vue'

defineProps<{
  open: boolean
  title: string
}>()
</script>

<template>
  <AppModal :open="open" class="max-w-[305px]" :show-close-button="false">
    <div class="flex flex-col items-center gap-3 py-4 text-center">
      <CheckCircle2 class="size-20 text-brand" />
      <h3 class="text-xl font-medium text-brand-dark">{{ title }}</h3>
      <p class="text-sm text-brand-gray">3 秒後自動關閉提示訊息</p>
    </div>
  </AppModal>
</template>
