<script setup lang="ts">
import AppModal from './AppModal.vue'

defineProps<{
  open: boolean
  dismiss?: () => void
}>()
</script>

<template>
  <AppModal :open="open" :dismiss="dismiss" title="關於回報系統" top="24px" class="max-w-[640px]">
    <div class="page-prose">
      <h3 class="mb-4 text-xl font-medium text-brand">關於回報系統</h3>
      <p>農地違章工廠舉報系統為協助民眾回報揭露農地違章工廠資訊，並非實際完成舉報。</p>
      <p>地球公民基金會將整理資料進行部分案件追蹤，完成舉報者可於「已舉報」案件查見。</p>
      <p>105.05.20 前的違章工廠我們將持續收集資訊，但本系統優先針對新增建與中高污染違章工廠進行舉報。</p>
      <p>本系統感謝 g0v.tw 社群朋友共同開發。</p>
      <p>
        既有疑似違章工廠資料來源為 2019 年 7 月 30 日取自內政部國土測繪圖資雲<a
          href="https://maps.nlsc.gov.tw/"
          target="_blank"
          rel="noreferrer"
          >網站</a
        >。
      </p>
      <p>
        全站使用者貢獻資料以
        <a href="https://creativecommons.org/licenses/by/3.0/tw/" target="_blank" rel="noreferrer"
          >CC BY 姓名標示 3.0</a
        >
        釋出，標註「© 農地違章工廠舉報小幫手貢獻者」，原始碼以 MIT 開放授權公開在
        <a href="https://github.com/Disfactory/Disfactory" target="_blank" rel="noreferrer">GitHub</a>
        上。
      </p>
    </div>
  </AppModal>
</template>
