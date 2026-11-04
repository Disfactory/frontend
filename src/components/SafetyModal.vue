<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import AppModal from './AppModal.vue'

defineProps<{
  open: boolean
  dismiss?: () => void
}>()

const slides = [
  { title: '安全須知', text: '請參考以下建議，前往違章工廠拍照蒐證' },
  { image: '/images/safety_notice/1.png', title: '場勘', text: '假裝路過，檢查有無監視器；尋找適合拍照的隱蔽處' },
  { image: '/images/safety_notice/2.png', title: '藏身', text: '盡量避開監視器、他人視線；盡量在隱蔽處拍照（例如：車上、民宅內、樹叢間、遠方）' },
  { image: '/images/safety_notice/3.png', title: '避嫌', text: '假如地點不夠隱密，請用手機拍照，降低他人戒心' },
  { image: '/images/safety_notice/4.png', title: '速離', text: '拍到 1 張清晰照片即可離去' },
  { image: '/images/safety_notice/5.png', title: '應變', text: '假如有人上前問話，請表現得「充滿好奇心」，試著跟對方聊天（例如：好奇水電師傅的施工技術），再伺機離開。' },
]

const index = ref(0)
const current = computed(() => slides[index.value]!)
const next = () => {
  index.value = (index.value + 1) % slides.length
}
const prev = () => {
  index.value = (index.value - 1 + slides.length) % slides.length
}
</script>

<template>
  <AppModal :open="open" :dismiss="dismiss" title="安全須知" class="max-w-[390px]">
    <div class="page-prose">
      <div class="min-h-[380px]">
        <h1 class="!mb-4 !border-none text-xl !text-brand">{{ current.title }}</h1>
        <img
          v-if="current.image"
          :src="current.image"
          :alt="current.title"
          class="mx-auto mb-4 max-h-[45vh] object-contain"
        />
        <p class="text-center leading-relaxed">{{ current.text }}</p>
      </div>
      <div class="mt-4 flex items-center justify-between">
        <button type="button" class="rounded p-2 text-brand hover:bg-brand/10" @click="prev">
          <ChevronLeft class="size-6" />
        </button>
        <div class="flex gap-1.5">
          <button
            v-for="(_, i) in slides"
            :key="i"
            type="button"
            class="size-2 rounded-full"
            :class="i === index ? 'bg-brand' : 'bg-[#e3e3e3]'"
            :aria-label="`第 ${i + 1} 頁`"
            @click="index = i"
          />
        </div>
        <button type="button" class="rounded p-2 text-brand hover:bg-brand/10" @click="next">
          <ChevronRight class="size-6" />
        </button>
      </div>
    </div>
  </AppModal>
</template>
