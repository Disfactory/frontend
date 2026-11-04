<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft } from '@lucide/vue'
import AppModal from './AppModal.vue'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'

const props = defineProps<{
  open: boolean
  dismiss?: () => void
}>()

type Page = 'home' | 'add' | 'update'
const page = ref<Page>('home')
const addImages = Array.from({ length: 7 }, (_, i) => `/images/tutorial/create-${i + 1}.jpg`)
const updateImages = Array.from({ length: 4 }, (_, i) => `/images/tutorial/update-${i + 1}.jpg`)

const isHome = computed(() => page.value === 'home')
const isAdd = computed(() => page.value === 'add')
const isUpdate = computed(() => page.value === 'update')

const addApi = ref<CarouselApi>()
const addSelected = ref(0)
function setAddApi(val: CarouselApi | undefined) {
  if (!val) return
  addApi.value = val
  addSelected.value = val.selectedScrollSnap()
  val.on('select', () => {
    addSelected.value = val.selectedScrollSnap()
  })
}

const updateApi = ref<CarouselApi>()
const updateSelected = ref(0)
function setUpdateApi(val: CarouselApi | undefined) {
  if (!val) return
  updateApi.value = val
  updateSelected.value = val.selectedScrollSnap()
  val.on('select', () => {
    updateSelected.value = val.selectedScrollSnap()
  })
}

const openHome = () => {
  page.value = 'home'
}
const openAdd = () => {
  addSelected.value = 0
  addApi.value?.scrollTo(0)
  page.value = 'add'
}
const openUpdate = () => {
  updateSelected.value = 0
  updateApi.value?.scrollTo(0)
  page.value = 'update'
}

const onDismiss = () => {
  openHome()
  props.dismiss?.()
}
</script>

<template>
  <AppModal :open="open" :dismiss="onDismiss" title="使用說明" top="24px" class="max-w-[640px]">
    <button
      v-if="isAdd || isUpdate"
      type="button"
      class="absolute top-5 left-5 rounded p-1 text-brand hover:bg-brand/10"
      aria-label="返回"
      @click="openHome"
    >
      <ArrowLeft class="size-6" />
    </button>

    <div class="page-prose min-w-0">
      <div v-show="isHome">
        <h2>使用說明</h2>
        <p>如果系統無法讀取你的位置請至手機系統設定開啟位置權限。</p>
        <button
          type="button"
          class="mb-4 w-full border border-brand px-5 py-3 text-left leading-relaxed text-brand transition hover:bg-brand hover:text-white"
          @click="openAdd"
        >
          如何新增一筆<br />違章工廠的資料？
        </button>
        <button
          type="button"
          class="w-full border border-brand px-5 py-3 text-left leading-relaxed text-brand transition hover:bg-brand hover:text-white"
          @click="openUpdate"
        >
          如何在一筆資料裡<br />補充更多資訊？
        </button>
      </div>

      <div v-if="isAdd" class="relative select-none">
        <Carousel :opts="{ loop: true }" @init-api="setAddApi">
          <CarouselContent class="-ml-0">
            <CarouselItem v-for="(image, i) in addImages" :key="image" class="pl-0">
              <div>
                <h2 class="text-center !text-brand">新增違章工廠 ({{ i + 1 }}/7)</h2>
                <img
                  :src="image"
                  :alt="`新增步驟 ${i + 1}`"
                  class="mx-auto max-h-[65vh] max-w-full object-contain"
                  draggable="false"
                />
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
        <div class="mt-4 flex justify-center gap-1.5">
          <button
            v-for="(_, i) in addImages"
            :key="i"
            type="button"
            class="size-2 rounded-full"
            :class="i === addSelected ? 'bg-brand' : 'bg-[#e3e3e3]'"
            :aria-label="`第 ${i + 1} 頁`"
            @click="addApi?.scrollTo(i)"
          />
        </div>
      </div>

      <div v-if="isUpdate" class="relative select-none">
        <Carousel :opts="{ loop: true }" @init-api="setUpdateApi">
          <CarouselContent class="-ml-0">
            <CarouselItem v-for="(image, i) in updateImages" :key="image" class="pl-0">
              <div>
                <h2 class="text-center !text-brand">補充工廠資訊 ({{ i + 1 }}/4)</h2>
                <img
                  :src="image"
                  :alt="`補充步驟 ${i + 1}`"
                  class="mx-auto max-h-[65vh] max-w-full object-contain"
                  draggable="false"
                />
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
        <div class="mt-4 flex justify-center gap-1.5">
          <button
            v-for="(_, i) in updateImages"
            :key="i"
            type="button"
            class="size-2 rounded-full"
            :class="i === updateSelected ? 'bg-brand' : 'bg-[#e3e3e3]'"
            :aria-label="`第 ${i + 1} 頁`"
            @click="updateApi?.scrollTo(i)"
          />
        </div>
      </div>
    </div>
  </AppModal>
</template>
