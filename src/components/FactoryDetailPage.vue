<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useMediaQuery, useResizeObserver } from '@vueuse/core'
import { Camera, ChevronDown, ChevronLeft, ChevronRight, Share2, X } from '@lucide/vue'
import AppModal from './AppModal.vue'
import FactoryTimeline from './FactoryTimeline.vue'
import MapMarkerIcon from './MapMarkerIcon.vue'
import ImgurFallbackImage from './ImgurFallbackImage.vue'
import { getFactoryTypeText } from '@/lib/factory'
import { formatTimelineDate, getFactoryStatus } from '@/lib/timeline'
import { useAppStore } from '@/stores/app'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { getDisplayStatus, type FactoryImage } from '@/types'

const appStore = useAppStore()
const isDesktop = useMediaQuery('(min-width: 960px)')

const images = computed<FactoryImage[]>(() => appStore.factoryData?.images ?? [])
const imageCarousel = ref<HTMLElement | null>(null)
const canScrollCarouselLeft = ref(false)
const canScrollCarouselRight = ref(false)

const updateCarouselArrows = () => {
  const el = imageCarousel.value
  if (!el) return
  canScrollCarouselLeft.value = el.scrollLeft > 1
  canScrollCarouselRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

const scrollCarousel = (direction: number) => {
  imageCarousel.value?.scrollBy({ left: direction * 136, behavior: 'smooth' })
}

// The carousel only mounts with the 現場照片 tab; this fires once it's laid out
// and again whenever its size changes.
useResizeObserver(imageCarousel, updateCarouselArrows)
watch(images, async () => {
  await nextTick()
  updateCarouselArrows()
}, { deep: true })
const lightboxIndex = ref<number | null>(null)
const setLightboxIndex = (index: number) => {
  lightboxIndex.value = index
}
const lightboxApi = ref<CarouselApi>()
const lightboxSelected = ref(0)
const setLightboxApi = (val: CarouselApi | undefined) => {
  if (!val) return
  lightboxApi.value = val
  lightboxSelected.value = val.selectedScrollSnap()
  val.on('select', () => {
    lightboxSelected.value = val.selectedScrollSnap()
  })
}

const category = computed(() =>
  appStore.factoryData ? getDisplayStatus(getFactoryStatus(appStore.factoryData)) : null,
)
const factoryId = computed(() => appStore.factoryData?.display_number ?? '')
const factoryType = computed(() =>
  appStore.factoryData ? getFactoryTypeText(appStore.factoryData) : null,
)
const factoryName = computed(() => appStore.factoryData?.name ?? '')
const factoryAddressAndLandcode = computed(() => {
  const data = appStore.factoryData
  if (!data) return ''
  const { townname, sectname, sectcode, landcode } = data
  return townname && sectname && sectcode && landcode
    ? `${townname}${sectname}(${sectcode})${landcode}地號`
    : '地段擷取中'
})
const source = computed(() => {
  const raw = appStore.factoryData?.source
  if (!raw) return ''
  return raw
    .split('')
    .map((char) => ({ U: '本系統', G: '農委會', E: '經濟部' })[char] ?? '')
    .filter(Boolean)
    .join('、')
})
const full = computed(() => appStore.factoryDetailsExpanded)
const longitude = computed(() => appStore.factoryData?.lng.toFixed(6))
const latitude = computed(() => appStore.factoryData?.lat.toFixed(6))
const lastUpdatedAt = computed(() => {
  const reportedAt = appStore.factoryData?.reported_at
  return reportedAt ? formatTimelineDate(reportedAt) : null
})

type DetailTab = 'history' | 'photos' | 'info'
const activeTab = ref<DetailTab>('history')
watch(
  () => appStore.factoryData?.id,
  () => {
    activeTab.value = 'history'
  },
)

const scroller = ref<HTMLElement | null>(null)

const showCopiedMessage = ref(false)
const copyToClipboard = async () => {
  const factory = appStore.factoryData
  if (!factory) return
  const { host, protocol } = window.location
  const url = `${protocol}//${host}/#map=16/${factory.lng}/${factory.lat}&factoryId=${factory.id}`
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = url
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }
  showCopiedMessage.value = true
  window.setTimeout(() => {
    showCopiedMessage.value = false
  }, 1000)
}

const startUpdateFactoryCommentFor = (field: 'others' | 'name' | 'factory_type' = 'others') => {
  appStore.startUpdateFactoryComment(field)
}

</script>

<template>
  <aside
    v-if="appStore.factoryData && !appStore.formPageOpen"
    data-testid="detail-panel"
    class="fixed inset-x-0 bottom-0 z-20 flex max-h-[calc(100%-56px)] flex-col bg-white pb-[env(safe-area-inset-bottom)] shadow-xl transition-transform duration-200 md:top-16 md:right-0 md:bottom-0 md:left-auto md:w-[395px] md:border-l"
    :class="[
      full ? 'top-0 z-40 max-h-none md:top-16 md:z-20' : 'top-auto',
      full ? 'md:translate-x-0' : 'md:translate-x-full',
    ]"
  >
    <button
      v-if="appStore.factoryData"
      type="button"
      class="absolute top-6 -left-[30px] hidden h-[74px] w-[30px] items-center justify-center rounded-l-lg bg-white shadow md:flex"
      aria-label="收合工廠資訊"
      @click="appStore.toggleFactoryDetail()"
    >
      <ChevronLeft class="size-5 text-brand" :class="{ 'rotate-180': full }" />
    </button>

    <div
      v-if="appStore.factoryData"
      ref="scroller"
      data-testid="detail-scroller"
      class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
    >
      <div v-if="showCopiedMessage" class="flex h-10 items-center justify-center bg-brand text-sm text-white">
        已複製連結
      </div>

      <header class="px-6 pt-4">
        <div class="flex items-center justify-between gap-3">
          <span class="text-sm font-medium text-brand-gray-light">工廠編號 {{ factoryId }}</span>
          <span class="flex items-center gap-1">
            <button
              type="button"
              class="rounded p-1 text-brand-dark hover:bg-black/5"
              :aria-label="showCopiedMessage ? '已複製連結' : '分享工廠'"
              @click="copyToClipboard"
            >
              <Share2 class="size-6" />
            </button>
            <button
              type="button"
              class="rounded p-1 hover:bg-black/5 md:hidden"
              aria-label="關閉"
              @click="appStore.collapseFactoryDetail()"
            >
              <X class="size-6" />
            </button>
          </span>
        </div>

        <h2 data-testid="factory-status" class="mt-3 flex items-center gap-3 text-2xl font-bold text-brand-dark">
          <MapMarkerIcon class="size-7 shrink-0" :style="{ color: category?.color }" />
          {{ category?.title }}
        </h2>

        <div class="mt-3 flex flex-col gap-2 text-[#333333]">
          <p class="text-sm font-medium">{{ factoryAddressAndLandcode }}</p>
          <p class="text-xs font-medium">{{ latitude }}, {{ longitude }} ( 經緯度版本為WGS84 )</p>
        </div>
      </header>

      <div v-if="!full" class="px-6 md:hidden">
        <button
          type="button"
          data-testid="expand-detail"
          class="sticky bottom-0 z-[1] flex w-full items-center gap-1 bg-white pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] text-left text-sm font-medium text-brand"
          @click="appStore.expandFactoryDetail()"
        >
          顯示更多資訊 <ChevronDown class="size-4" />
        </button>
      </div>

      <Tabs
        v-if="full || isDesktop"
        v-model="activeTab"
        class="mt-6 gap-0 px-6 pb-6"
      >
        <TabsList variant="line" class="h-auto w-full gap-4 border-b border-brand-gray-light p-0">
          <TabsTrigger
            v-for="tab in ([['history', '過往紀錄'], ['photos', '現場照片'], ['info', '工廠資訊']] as const)"
            :key="tab[0]"
            :value="tab[0]"
            class="rounded-none border-0 px-1 pb-2 text-sm font-medium text-[#565B66] after:bottom-[-1px] after:bg-[#4A5613] hover:text-brand data-[state=active]:text-brand"
          >
            {{ tab[1] }}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" class="pt-6">
          <FactoryTimeline v-if="appStore.factoryData" :factory="appStore.factoryData" />

          <div class="flex gap-4 border-t border-brand-gray-light pt-6">
            <button
              type="button"
              class="flex-1 rounded-[5px] border border-brand bg-white px-[15px] py-[5px] text-base text-[#333333]"
              @click="appStore.startUpdateFactoryImages()"
            >
              上傳照片
            </button>
            <button
              type="button"
              class="flex-1 rounded-[5px] border border-brand bg-white px-[15px] py-[5px] text-base text-[#333333]"
              @click="startUpdateFactoryCommentFor('others')"
            >
              補充工廠描述
            </button>
          </div>
        </TabsContent>

        <TabsContent value="photos" class="-mx-6 pt-6">
          <div class="flex">
            <button
              v-if="images.length > 0"
              type="button"
              class="flex h-[68px] w-[52px] shrink-0 items-center justify-center text-brand-gray transition disabled:opacity-30"
              :disabled="!canScrollCarouselLeft"
              aria-label="上一張工廠照片"
              @click="scrollCarousel(-1)"
            >
              <ChevronLeft class="size-6" />
            </button>

            <div
              ref="imageCarousel"
              data-testid="image-carousel"
              class="flex min-w-0 flex-1 touch-auto gap-4 overflow-x-auto overscroll-x-contain"
              style="-webkit-overflow-scrolling: touch"
              @scroll="updateCarouselArrows"
            >
              <button
                type="button"
                data-testid="update-image-button"
                class="ml-6 flex h-[68px] w-[100px] shrink-0 flex-col items-center justify-center gap-1 bg-brand-dark text-xs text-white"
                @click="appStore.startUpdateFactoryImages()"
              >
                <Camera class="size-5" />
                補充照片
              </button>
              <button
                v-for="(image, index) in images"
                :key="image.id"
                type="button"
                data-testid="carousel-image"
                class="h-[68px] w-[120px] shrink-0 overflow-hidden"
                @click="setLightboxIndex(index)"
              >
                <ImgurFallbackImage :src="image.url" class="h-full w-full object-cover" />
              </button>
            </div>

            <button
              v-if="images.length > 0"
              type="button"
              class="flex h-[68px] w-[52px] shrink-0 items-center justify-center text-brand-gray transition disabled:opacity-30"
              :disabled="!canScrollCarouselRight"
              aria-label="下一張工廠照片"
              @click="scrollCarousel(1)"
            >
              <ChevronRight class="size-6" />
            </button>
          </div>
          <p v-if="images.length === 0" class="mx-6 mt-4 text-sm text-brand-gray-light">
            目前還沒有現場照片。
          </p>
        </TabsContent>

        <TabsContent value="info" class="pt-6">
          <template v-if="source">
            <h3 class="mb-1 text-base font-medium text-brand">資料來源</h3>
            <p class="mb-5">{{ source }}</p>
          </template>

          <template v-if="lastUpdatedAt">
            <h3 class="mb-1 text-base font-medium text-brand">最後更新</h3>
            <p class="mb-5">{{ lastUpdatedAt }}</p>
          </template>

          <h3 class="mb-1 text-base font-medium text-brand">工廠外部文字</h3>
          <p v-if="factoryName" class="mb-3">{{ factoryName }}</p>
          <button
            type="button"
            class="mb-5 rounded border border-brand px-4 py-2 text-sm text-brand"
            @click="startUpdateFactoryCommentFor('name')"
          >
            {{ factoryName ? '更改外部文字' : '回報外部文字' }}
          </button>

          <h3 class="mb-1 text-base font-medium text-brand">工廠類型</h3>
          <p v-if="factoryType" class="mb-3">{{ factoryType }}</p>
          <button
            type="button"
            class="rounded border border-brand px-4 py-2 text-sm text-brand"
            @click="startUpdateFactoryCommentFor('factory_type')"
          >
            {{ factoryType ? '更改工廠類型' : '回報工廠類型' }}
          </button>
        </TabsContent>
      </Tabs>
    </div>

  </aside>

  <AppModal
    :open="lightboxIndex !== null"
    title="工廠照片"
    centered
    :dismiss="() => (lightboxIndex = null)"
    overlay-class="bg-[rgba(30,30,30,0.9)]"
    class="max-w-[min(90vw,900px)] border-0 p-0 sm:max-w-[min(90vw,900px)]"
  >
    <div data-testid="lightbox-content" class="relative min-w-0 select-none">
      <Carousel :opts="{ startIndex: lightboxIndex ?? 0, loop: true }" @init-api="setLightboxApi">
        <CarouselContent class="-ml-0">
          <CarouselItem v-for="(image, i) in images" :key="image.id" class="pl-0">
            <img
              :src="image.url"
              :alt="`工廠照片 ${i + 1}`"
              class="max-h-[80vh] w-full object-contain"
              draggable="false"
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
      <button
        type="button"
        class="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
        aria-label="上一張"
        @click="lightboxApi?.scrollPrev()"
      >
        <ChevronLeft class="size-6" />
      </button>
      <button
        type="button"
        class="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
        aria-label="下一張"
        @click="lightboxApi?.scrollNext()"
      >
        <ChevronRight class="size-6" />
      </button>
      <span data-testid="lightbox-counter" class="sr-only" aria-live="polite">
        {{ lightboxSelected + 1 }} / {{ images.length }}
      </span>
    </div>
  </AppModal>
</template>
