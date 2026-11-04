<script setup lang="ts">
import { ref } from 'vue'
import AppModal from './AppModal.vue'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'

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

const api = ref<CarouselApi>()
const selected = ref(0)

function setApi(val: CarouselApi | undefined) {
  if (!val) return
  api.value = val
  selected.value = val.selectedScrollSnap()
  val.on('select', () => {
    selected.value = val.selectedScrollSnap()
  })
}
</script>

<template>
  <AppModal :open="open" :dismiss="dismiss" title="安全須知" centered class="max-w-[390px]">
    <div class="page-prose relative select-none" data-testid="safety-carousel">
      <Carousel :opts="{ loop: true }" @init-api="setApi">
        <CarouselContent class="-ml-0">
          <CarouselItem v-for="slide in slides" :key="slide.title" class="pl-0">
            <div class="min-h-[380px] pb-10">
              <h1 class="!mb-4 !border-none text-xl !text-brand">{{ slide.title }}</h1>
              <img
                v-if="slide.image"
                :src="slide.image"
                :alt="slide.title"
                class="mx-auto mb-4 max-h-[45vh] object-contain"
                draggable="false"
              />
              <p class="text-center leading-relaxed">{{ slide.text }}</p>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious
          class="absolute top-1/2 left-0 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/30"
          aria-label="上一張"
        />
        <CarouselNext
          class="absolute top-1/2 right-0 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/30"
          aria-label="下一張"
        />
      </Carousel>
      <div class="absolute inset-x-0 bottom-0 flex justify-center gap-1.5">
        <button
          v-for="(_, i) in slides"
          :key="i"
          type="button"
          class="size-2 rounded-full"
          :class="i === selected ? 'bg-brand' : 'bg-[#e3e3e3]'"
          :aria-label="`第 ${i + 1} 頁`"
          @click="api?.scrollTo(i)"
        />
      </div>
    </div>
  </AppModal>
</template>
