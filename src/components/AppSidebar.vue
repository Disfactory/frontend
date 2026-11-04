<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useModalStore } from '@/stores/modals'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const modalStore = useModalStore()

type Item =
  | { text: string; action: () => void }
  | { text: string; href: string }
  | { spacer: true }

const items: Item[] = [
  { text: '使用教學', action: modalStore.openTutorialModal },
  { text: '安全須知', action: modalStore.openSafetyModal },
  { text: '聯絡我們', action: modalStore.openContactModal },
  { spacer: true },
  { text: '關於回報系統', href: 'https://about.disfactory.tw' },
  { text: '問題回報', href: 'https://airtable.com/shrUraKakZRpH52DO' },
]

const onKeydown = (event: KeyboardEvent) => {
  if (props.open && event.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const onClick = (item: Extract<Item, { action: () => void }>) => {
  item.action()
  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-[70] transition-opacity duration-300"
    :class="open ? 'opacity-100' : 'pointer-events-none opacity-0'"
  >
    <div class="absolute inset-0 bg-black/45" @click="emit('close')" />

    <aside
      class="absolute top-0 right-0 bottom-0 w-64 overflow-y-auto bg-white shadow-xl transition-transform duration-300"
      :class="open ? 'translate-x-0' : 'translate-x-full'"
      aria-label="主選單"
    >
      <ul class="pt-2">
        <li v-for="(item, index) in items" :key="index">
          <div v-if="'spacer' in item" class="h-12" aria-hidden="true" />
          <button
            v-else-if="'action' in item"
            type="button"
            class="block w-full px-4 py-2.5 text-left text-base text-black transition hover:bg-black/5"
            @click="onClick(item)"
          >
            {{ item.text }}
          </button>
          <a
            v-else
            :href="item.href"
            target="_blank"
            rel="noreferrer"
            class="block w-full px-4 py-2.5 text-left text-base text-black transition hover:bg-black/5"
          >
            {{ item.text }}
          </a>
        </li>
      </ul>
    </aside>
  </div>
</template>
