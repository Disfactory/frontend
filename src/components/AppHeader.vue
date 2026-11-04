<script setup lang="ts">
import { Menu } from '@lucide/vue'
import { useModalStore } from '@/stores/modals'

defineEmits<{ 'open-menu': [] }>()

const modalStore = useModalStore()
const links = [
  { text: '使用教學', action: modalStore.openTutorialModal },
  { text: '安全須知', action: modalStore.openSafetyModal },
  { text: '聯絡我們', action: modalStore.openContactModal },
  { text: '常見問題', href: 'https://about.disfactory.tw/#question' },
  { text: '關於回報系統', href: 'https://about.disfactory.tw' },
  { text: '問題回報', href: 'https://airtable.com/shrUraKakZRpH52DO' },
]
</script>

<template>
  <header class="z-30 flex h-14 shrink-0 items-center justify-between bg-brand px-3 text-white shadow-md">
    <div class="w-10 md:hidden" />
    <h1 class="text-lg font-medium tracking-wide">農地工廠回報</h1>

    <nav class="hidden items-center gap-1 md:flex">
      <template v-for="link in links" :key="link.text">
        <button
          v-if="link.action"
          type="button"
          class="rounded px-3 py-2 text-sm transition hover:bg-white/10"
          @click="link.action()"
        >
          {{ link.text }}
        </button>
        <a
          v-else
          :href="link.href"
          target="_blank"
          rel="noreferrer"
          class="rounded px-3 py-2 text-sm transition hover:bg-white/10"
        >
          {{ link.text }}
        </a>
      </template>
    </nav>

    <button
      type="button"
      class="rounded p-2 hover:bg-white/10 md:hidden"
      aria-label="開啟主選單"
      @click="$emit('open-menu')"
    >
      <Menu class="size-6" />
    </button>
  </header>
</template>
