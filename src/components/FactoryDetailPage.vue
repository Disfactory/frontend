<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { Camera, ChevronDown, ChevronLeft, ChevronRight, MapPin, Share2, X } from '@lucide/vue'
import AppModal from './AppModal.vue'
import ImgurFallbackImage from './ImgurFallbackImage.vue'
import { getFactoryStatus, getStatusBorderColor } from '@/lib/map'
import { getFactoryTypeText } from '@/lib/factory'
import { getFactoryReportRecords } from '@/api'
import { useCarouselSwipe } from '@/lib/useCarouselSwipe'
import { useAppStore } from '@/stores/app'
import { getDisplayStatusText, type FactoryImage, type ReportRecord } from '@/types'

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

onMounted(updateCarouselArrows)
watch(images, async () => {
  await nextTick()
  updateCarouselArrows()
}, { deep: true })
const lightboxIndex = ref<number | null>(null)
const setLightboxIndex = (index: number) => {
  lightboxIndex.value = index
}
const currentLightboxImage = computed(() =>
  lightboxIndex.value === null ? null : (images.value[lightboxIndex.value] ?? null),
)
const nextLightbox = () => {
  if (lightboxIndex.value === null || images.value.length === 0) return
  lightboxIndex.value = (lightboxIndex.value + 1) % images.value.length
}
const prevLightbox = () => {
  if (lightboxIndex.value === null || images.value.length === 0) return
  lightboxIndex.value = (lightboxIndex.value - 1 + images.value.length) % images.value.length
}
const {
  dragX: lightboxDragX,
  dragging: lightboxDragging,
  onPointerDown: onLightboxPointerDown,
  onPointerMove: onLightboxPointerMove,
  onPointerUp: onLightboxPointerUp,
  onPointerCancel: onLightboxPointerCancel,
} = useCarouselSwipe(nextLightbox, prevLightbox)

const factoryStatus = computed(() =>
  appStore.factoryData ? getFactoryStatus(appStore.factoryData) : undefined,
)
const factoryFollowups = computed(() => appStore.factoryData?.follow_ups_for_user ?? [])
const factoryStatusText = computed(() => {
  if (typeof factoryStatus.value === 'undefined') return ''
  const name = getDisplayStatusText(factoryStatus.value)
  const documentStatus = appStore.factoryData?.document_display_status
  return documentStatus ? `${name}：${documentStatus}` : name
})
const statusColor = computed(() =>
  typeof factoryStatus.value === 'undefined' ? null : getStatusBorderColor(factoryStatus.value),
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
    ? `${townname} ${sectname} (${sectcode}) ${landcode}地號`
    : '擷取中'
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
const longitude = computed(() => appStore.factoryData?.lng.toFixed(7))
const latitude = computed(() => appStore.factoryData?.lat.toFixed(7))

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

const reportRecords = ref<ReportRecord[]>([])
watch(
  () => appStore.factoryData,
  async (factory) => {
    if (!factory) {
      reportRecords.value = []
      return
    }
    try {
      reportRecords.value = ((await getFactoryReportRecords(factory.id)) || []).sort((a, b) =>
        new Date(b.created_at) >= new Date(a.created_at) ? 1 : -1,
      )
    } catch {
      reportRecords.value = []
    }
  },
  { immediate: true },
)

const pastDescriptions = computed(() =>
  reportRecords.value
    .map((record) => {
      const date = new Date(record.created_at)
      return {
        date: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
        others: record.others,
      }
    })
    .filter((record) => record.others),
)
const lastUpdatedAt = computed(() => {
  const factory = appStore.factoryData
  if (!factory?.reported_at) return null
  const date =
    reportRecords.value.length === 0
      ? new Date(factory.reported_at)
      : new Date(reportRecords.value[0]?.created_at as string)
  return `最後更新 ${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
})
</script>

<template>
  <aside
    v-if="appStore.factoryData && !appStore.formPageOpen"
    data-testid="detail-panel"
    class="fixed inset-x-0 bottom-0 z-20 flex max-h-[calc(100%-56px)] flex-col bg-white shadow-xl transition-transform duration-200 md:top-16 md:right-0 md:bottom-0 md:left-auto md:w-[395px] md:border-l"
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

      <div class="px-4 pt-3">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-base text-brand-dark">工廠狀態</span>
          <button
            type="button"
            class="hidden rounded-full border px-4 py-2 text-sm md:block"
            :class="showCopiedMessage ? 'border-brand bg-brand text-white' : 'border-brand-line bg-white text-brand shadow-sm'"
            @click="copyToClipboard"
          >
            <Share2 class="mr-1 inline size-4" />
            {{ showCopiedMessage ? '已複製連結' : '分享工廠' }}
          </button>
          <span class="flex items-center gap-2 md:hidden">
            <button type="button" class="rounded p-1 hover:bg-black/5" aria-label="分享工廠" @click="copyToClipboard">
              <Share2 class="size-5" />
            </button>
            <button
              type="button"
              class="rounded p-1 hover:bg-black/5"
              aria-label="關閉"
              @click="appStore.collapseFactoryDetail()"
            >
              <X class="size-5" />
            </button>
          </span>
        </div>

        <p class="mb-2 text-2xl text-brand-dark">
          <MapPin class="mb-1 inline size-5" :style="{ color: statusColor ?? undefined }" />
          {{ factoryStatusText }}
        </p>
        <p class="mb-0 text-xs text-brand-gray-light">
          工廠編號 {{ factoryId }}<br />
          {{ lastUpdatedAt }}
        </p>
      </div>

      <div class="mt-4 flex">
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
            class="ml-4 flex h-[68px] w-[100px] shrink-0 flex-col items-center justify-center gap-1 bg-brand-dark text-xs text-white"
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

      <div class="mx-4 mt-4 mb-2">
        <h3 class="mb-1 text-base font-medium text-brand">地段 / 地址</h3>
        <p class="mb-5">{{ factoryAddressAndLandcode }}</p>

        <div v-if="full || isDesktop" class="mb-5">
          <h3 class="mb-1 text-base font-medium text-brand">經緯度</h3>
          <p class="mb-1">{{ longitude }}, {{ latitude }}</p>
          <p class="text-xs text-brand-gray-light">以上經緯度版本為 WGS84</p>
        </div>

        <template v-if="source">
          <h3 class="mb-1 text-base font-medium text-brand">資料來源</h3>
          <p class="mb-5">{{ source }}</p>
        </template>

        <hr v-if="full || isDesktop" class="my-4 border-brand-line" />

        <button
          v-if="!full"
          type="button"
          data-testid="expand-detail"
          class="sticky bottom-0 z-[1] flex w-full items-center gap-1 bg-white py-3 text-left text-sm font-medium text-brand md:hidden"
          @click="appStore.expandFactoryDetail()"
        >
          顯示更多資訊 <ChevronDown class="size-4" />
        </button>

        <div v-if="full">
          <h2 class="mb-5 text-xl font-medium text-brand-dark">其他工廠資訊</h2>

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
            class="mb-5 rounded border border-brand px-4 py-2 text-sm text-brand"
            @click="startUpdateFactoryCommentFor('factory_type')"
          >
            {{ factoryType ? '更改工廠類型' : '回報工廠類型' }}
          </button>

          <h3 class="mb-1 text-base font-medium text-brand">工廠描述</h3>
          <button
            type="button"
            class="mb-2 rounded border border-brand px-4 py-2 text-sm text-brand"
            @click="startUpdateFactoryCommentFor('others')"
          >
            補充工廠描述
          </button>

          <div v-for="(desc, index) in pastDescriptions" :key="index" class="mt-2 text-sm">
            <p class="mb-1 text-brand-gray-light">{{ desc.date }}</p>
            <p class="leading-6">{{ desc.others }}</p>
          </div>

          <template v-if="factoryFollowups.length > 0">
            <h3 class="mt-5 mb-1 text-base font-medium text-brand">政府回應</h3>
            <div v-for="(followup, index) in factoryFollowups" :key="index" class="mt-2 text-sm">
              <p class="leading-6">{{ followup.note }}</p>
            </div>
          </template>
        </div>
      </div>
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
    <div
      data-testid="lightbox-content"
      class="relative touch-pan-y select-none"
      :style="{
        transform: `translateX(${lightboxDragX}px)`,
        transition: lightboxDragging ? 'none' : 'transform 200ms ease',
      }"
      @pointerdown="onLightboxPointerDown"
      @pointermove="onLightboxPointerMove"
      @pointerup="onLightboxPointerUp"
      @pointercancel="onLightboxPointerCancel"
    >
      <img
        v-if="currentLightboxImage"
        :src="currentLightboxImage.url"
        alt=""
        class="max-h-[80vh] w-full object-contain"
        draggable="false"
      />
      <button
        type="button"
        class="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
        aria-label="上一張"
        @click="prevLightbox"
      >
        <ChevronLeft class="size-6" />
      </button>
      <button
        type="button"
        class="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
        aria-label="下一張"
        @click="nextLightbox"
      >
        <ChevronRight class="size-6" />
      </button>
    </div>
  </AppModal>
</template>
