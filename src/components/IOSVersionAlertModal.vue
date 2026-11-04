<script setup lang="ts">
import AppModal from './AppModal.vue'
import AppButton from './AppButton.vue'

defineProps<{
  open: boolean
  dismiss?: () => void
}>()
</script>

<template>
  <AppModal :open="open" :dismiss="dismiss" title="iOS 版本提醒" top="24px" class="max-w-[640px]">
    <div class="page-prose">
      <h3 class="text-xl leading-relaxed font-medium text-brand">
        ⚠️ 你的手機無法新增可疑工廠
      </h3>
      <p>
        很抱歉，你的 iPhone iOS 操作系統無法成功在本網站上傳照片。<br />
        請改用電腦新增可疑工廠照片或是至「系統設定」升級 iOS 操作系統版本到至少 13.4
        以上。瀏覽地圖功能則不受影響。
      </p>
      <AppButton class="mt-4" @click="dismiss">知道了</AppButton>
    </div>
  </AppModal>
</template>
