<script setup lang="ts">
import { Download, Share, X } from '@lucide/vue'
import { usePwaStore } from '@/stores/pwa'

const pwaStore = usePwaStore()
</script>

<template>
  <div
    v-if="pwaStore.shouldPrompt"
    data-testid="pwa-install-banner"
    class="flex shrink-0 items-center gap-3 bg-brand-line px-4 py-2.5 text-brand-dark"
    role="region"
    aria-label="安裝應用程式"
  >
    <Share v-if="pwaStore.isIos" class="size-5 shrink-0" aria-hidden="true" />
    <Download v-else class="size-5 shrink-0" aria-hidden="true" />
    <p class="min-w-0 flex-1 text-sm leading-snug">
      <template v-if="pwaStore.isIos">
        將本站加入主畫面：點分享按鈕，再選「加入主畫面」，快速開啟回報。
      </template>
      <template v-else> 把「農地工廠回報」安裝到主畫面，快速開啟回報。 </template>
    </p>
    <button
      v-if="!pwaStore.isIos"
      type="button"
      data-testid="pwa-install-cta"
      class="shrink-0 rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-dark"
      @click="pwaStore.promptInstall()"
    >
      安裝
    </button>
    <button
      type="button"
      data-testid="pwa-install-dismiss"
      class="shrink-0 rounded p-1 transition hover:bg-brand/10"
      aria-label="關閉安裝提示"
      @click="pwaStore.dismiss()"
    >
      <X class="size-5" />
    </button>
  </div>
</template>
