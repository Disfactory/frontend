<script setup lang="ts">
import AppModal from './AppModal.vue'
import AppButton from './AppButton.vue'

const props = defineProps<{
  open: boolean
  dismiss?: () => void
}>()

const agree = () => {
  window.localStorage?.setItem('use-app', 'true')
  props.dismiss?.()
}
</script>

<template>
  <AppModal :open="open" :show-close-button="false" title="歡迎來到農地違章工廠回報系統" top="24px" class="max-w-[640px]">
    <div class="page-prose">
      <h3 class="mb-6 text-center text-lg font-normal text-brand">
        歡迎來到<b>農地違章工廠回報系統！</b>
      </h3>
      <p>需要大家回報以下工廠之照片及資訊：</p>
      <ul class="mb-4 list-disc pl-6">
        <li>2016.05.20 後新增的農地違章工廠</li>
        <li>中高污染工廠</li>
      </ul>
      <p>以上資訊將由<b>地球公民基金會</b>彙整後，向政府舉報並追蹤拆除進度。</p>
      <small class="my-4 block text-center leading-tight">
        行動前請同意資料貢獻<a
          href="https://license.disfactory.tw/#%E8%BE%B2%E5%9C%B0%E9%81%95%E7%AB%A0%E5%B7%A5%E5%BB%A0%E5%9B%9E%E5%A0%B1%E7%B3%BB%E7%B5%B1%EF%BC%88disfactory%EF%BC%89%E8%B2%A2%E7%8D%BB%E5%8D%94%E8%AD%B0"
          target="_blank"
          rel="noreferrer"
          >授權條款</a
        >與<a
          href="https://license.disfactory.tw/#%E9%9A%B1%E7%A7%81%E6%AC%8A%E6%A2%9D%E6%AC%BE"
          target="_blank"
          rel="noreferrer"
          >隱私條款</a
        >。本網站由<a href="https://www.cet-taiwan.org/" target="_blank" rel="noreferrer"
          >地球公民基金會</a
        >與 <a href="https://g0v.tw/" target="_blank" rel="noreferrer">g0v.tw</a> 社群共同開發。
      </small>
      <AppButton @click="agree">我同意加入回報</AppButton>
      <small class="mt-4 block text-center">
        <a href="https://about.disfactory.tw">我不同意，請帶我離開這個頁面</a>
      </small>
    </div>
  </AppModal>
</template>
