<script setup lang="ts">
import { computed, ref } from 'vue'
import AppModal from './AppModal.vue'
import AppButton from './AppButton.vue'
import AppTextField from './AppTextField.vue'
import {
  currentBaseURL,
  getCustomBaseURL,
  getDefaultBaseURL,
  resetToDefaultBaseURL,
  setCustomBaseURL,
} from '@/lib/apiConfig'

const props = defineProps<{
  open: boolean
  dismiss?: () => void
}>()

const apiUrl = ref(getCustomBaseURL() || '')
const defaultUrl = getDefaultBaseURL()
const currentUrl = computed(() => currentBaseURL.value)

const saveConfiguration = () => {
  const url = apiUrl.value.trim()
  if (url) setCustomBaseURL(url)
  else resetToDefaultBaseURL()
  props.dismiss?.()
}

const resetToDefault = () => {
  apiUrl.value = ''
  resetToDefaultBaseURL()
  props.dismiss?.()
}
</script>

<template>
  <AppModal :open="open" :dismiss="dismiss" class="max-w-[500px]">
    <div class="page-prose">
      <h3 class="text-xl font-medium text-brand">API 設定</h3>
      <label class="mt-4 mb-2 block font-bold">API 基礎網址</label>
      <AppTextField v-model="apiUrl" :placeholder="defaultUrl" data-testid="api-url-input" />
      <small class="mt-1 block text-brand-gray-light">留空將使用預設值：{{ defaultUrl }}</small>
      <div class="mt-5 flex flex-wrap gap-3">
        <AppButton class="min-w-[120px] flex-1" @click="saveConfiguration">儲存設定</AppButton>
        <AppButton class="min-w-[120px] flex-1" outline @click="resetToDefault">重置為預設值</AppButton>
      </div>
      <div class="mt-5 rounded bg-[#f5f5f5] p-4 text-sm">
        <strong>目前使用的 API 網址：</strong>
        <span class="mt-1 block break-all font-mono text-brand">{{ currentUrl }}</span>
      </div>
    </div>
  </AppModal>
</template>
