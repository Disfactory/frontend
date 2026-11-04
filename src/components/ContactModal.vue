<script setup lang="ts">
import AppModal from './AppModal.vue'

defineProps<{
  open: boolean
  dismiss?: () => void
}>()
</script>

<template>
  <AppModal :open="open" :dismiss="dismiss" title="聯絡我們" class="max-w-[640px]">
    <div class="page-prose text-center">
      <img width="137" src="/images/cet-logo.png" alt="Citizen of the Earth Taiwan" class="mx-auto" />
      <h3 class="mt-6 text-xl leading-relaxed font-medium text-brand">
        有任何回報相關問題<br />歡迎聯絡
      </h3>
      <p class="mt-4">
        地球公民基金會<br />
        TEL: 02-23920371<br />
        Email: <a href="mailto:cet@cet-taiwan.org">cet@cet-taiwan.org</a>
      </p>
    </div>
  </AppModal>
</template>
