<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { X } from '@lucide/vue'
import { useModalStore } from '@/stores/modals'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const modalStore = useModalStore()
const links = [
  { text: '使用說明', action: modalStore.openTutorialModal },
  { text: '安全須知', action: modalStore.openSafetyModal },
  { text: '聯絡我們', action: modalStore.openContactModal },
  { text: '常見問題', href: 'https://about.disfactory.tw/#question' },
  { text: '關於回報系統', href: 'https://about.disfactory.tw' },
  { text: '問題回報', href: 'https://airtable.com/shrUraKakZRpH52DO' },
]

const onKeydown = (event: KeyboardEvent) => {
  if (props.open && event.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const onClick = (link: { action?: () => void }) => {
  if (link.action) link.action()
  emit('close')
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[70] bg-black/40" @click="emit('close')">
    <aside
      class="absolute top-0 right-0 bottom-0 w-[90%] max-w-[400px] bg-[#6d8538] px-8 pt-14 pb-5 text-white"
      @click.stop
    >
      <button
        type="button"
        class="absolute top-5 left-7 rounded p-1 text-white hover:bg-white/10"
        aria-label="關閉主選單"
        @click="emit('close')"
      >
        <X class="size-6" />
      </button>
      <h1 class="mb-4 text-4xl leading-tight">主選單</h1>
      <hr class="mb-6 w-3/5 border-white/80" />
      <ul class="space-y-1">
        <li v-for="link in links" :key="link.text">
          <button
            v-if="link.action"
            type="button"
            class="block w-full py-1 text-left text-2xl leading-loose hover:underline"
            @click="onClick(link)"
          >
            {{ link.text }}
          </button>
          <a
            v-else
            :href="link.href"
            target="_blank"
            rel="noreferrer"
            class="block w-full py-1 text-left text-2xl leading-loose hover:underline"
          >
            {{ link.text }}
          </a>
        </li>
      </ul>
    </aside>
  </div>
</template>
