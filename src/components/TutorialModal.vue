<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft, ChevronLeft, ChevronRight } from '@lucide/vue'
import AppModal from './AppModal.vue'

const props = defineProps<{
  open: boolean
  dismiss?: () => void
}>()

type Page = 'home' | 'add' | 'update'
const page = ref<Page>('home')
const addIndex = ref(0)
const updateIndex = ref(0)
const addImages = Array.from({ length: 7 }, (_, i) => `/images/tutorial/create-${i + 1}.jpg`)
const updateImages = Array.from({ length: 4 }, (_, i) => `/images/tutorial/update-${i + 1}.jpg`)

const isHome = computed(() => page.value === 'home')
const isAdd = computed(() => page.value === 'add')
const isUpdate = computed(() => page.value === 'update')

const openHome = () => {
  page.value = 'home'
}
const openAdd = () => {
  addIndex.value = 0
  page.value = 'add'
}
const openUpdate = () => {
  updateIndex.value = 0
  page.value = 'update'
}

const onDismiss = () => {
  openHome()
  props.dismiss?.()
}
</script>

<template>
  <AppModal :open="open" :dismiss="onDismiss" title="使用說明" class="max-w-[640px]">
    <button
      v-if="isAdd || isUpdate"
      type="button"
      class="absolute top-5 left-5 rounded p-1 text-brand hover:bg-brand/10"
      aria-label="返回"
      @click="openHome"
    >
      <ArrowLeft class="size-6" />
    </button>

    <div class="page-prose">
      <div v-show="isHome">
        <h2>使用說明</h2>
        <p>如果系統無法讀取你的位置，請至手機系統設定開啟位置權限。</p>
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

      <div v-if="isAdd">
        <h2 class="text-center !text-brand">新增違章工廠 ({{ addIndex + 1 }}/7)</h2>
        <img
          :src="addImages[addIndex]"
          :alt="`新增步驟 ${addIndex + 1}`"
          class="mx-auto max-h-[65vh] object-contain"
        />
        <div class="mt-4 flex items-center justify-between">
          <button
            type="button"
            class="rounded p-2 text-brand hover:bg-brand/10"
            @click="addIndex = (addIndex - 1 + addImages.length) % addImages.length"
          >
            <ChevronLeft class="size-6" />
          </button>
          <div class="flex gap-1.5">
            <button
              v-for="(_, i) in addImages"
              :key="i"
              type="button"
              class="size-2 rounded-full"
              :class="i === addIndex ? 'bg-brand' : 'bg-[#e3e3e3]'"
              @click="addIndex = i"
            />
          </div>
          <button
            type="button"
            class="rounded p-2 text-brand hover:bg-brand/10"
            @click="addIndex = (addIndex + 1) % addImages.length"
          >
            <ChevronRight class="size-6" />
          </button>
        </div>
      </div>

      <div v-if="isUpdate">
        <h2 class="text-center !text-brand">補充工廠資訊 ({{ updateIndex + 1 }}/4)</h2>
        <img
          :src="updateImages[updateIndex]"
          :alt="`補充步驟 ${updateIndex + 1}`"
          class="mx-auto max-h-[65vh] object-contain"
        />
        <div class="mt-4 flex items-center justify-between">
          <button
            type="button"
            class="rounded p-2 text-brand hover:bg-brand/10"
            @click="updateIndex = (updateIndex - 1 + updateImages.length) % updateImages.length"
          >
            <ChevronLeft class="size-6" />
          </button>
          <div class="flex gap-1.5">
            <button
              v-for="(_, i) in updateImages"
              :key="i"
              type="button"
              class="size-2 rounded-full"
              :class="i === updateIndex ? 'bg-brand' : 'bg-[#e3e3e3]'"
              @click="updateIndex = i"
            />
          </div>
          <button
            type="button"
            class="rounded p-2 text-brand hover:bg-brand/10"
            @click="updateIndex = (updateIndex + 1) % updateImages.length"
          >
            <ChevronRight class="size-6" />
          </button>
        </div>
      </div>
    </div>
  </AppModal>
</template>
