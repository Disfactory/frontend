<script setup lang="ts">
import { computed, ref } from 'vue'
import { onClickOutside, useMediaQuery } from '@vueuse/core'
import SwitchMapModeButton from '@/components/SwitchMapModeButton.vue'
import { useMapStore } from '@/stores/map'

const mapStore = useMapStore()
const isDesktop = useMediaQuery('(min-width: 960px)')
const isOpen = ref(false)
const panel = ref<HTMLElement | null>(null)

onClickOutside(panel, () => {
  if (isDesktop.value) isOpen.value = false
})

const isLUIMapVisible = computed({
  get: () => mapStore.luiVisible,
  set: (value: boolean) => mapStore.setLUIVisible(value),
})
</script>

<template>
  <div ref="panel" class="relative shrink-0">
    <button
      type="button"
      class="rounded bg-brand px-3 py-2 text-sm font-medium text-white shadow-md"
      @click="isOpen = !isOpen"
    >
      顯示設定
    </button>

    <div
      v-if="isDesktop && isOpen"
      class="absolute top-full left-0 z-30 mt-3 w-[294px] rounded bg-white p-4 shadow-xl before:absolute before:-top-3 before:left-8 before:border-x-8 before:border-b-8 before:border-x-transparent before:border-b-white before:content-['']"
    >
      <div class="flex items-center justify-between gap-2 border-b border-black/5 pb-3">
        <h2 class="text-base font-bold text-brand">農地範圍 •</h2>
        <div class="flex gap-1">
          <button
            type="button"
            class="rounded px-2 py-1 text-sm text-brand"
            :class="!isLUIMapVisible ? 'font-bold' : 'font-light'"
            @click="isLUIMapVisible = false"
          >
            隱藏
          </button>
          <button
            type="button"
            class="rounded px-2 py-1 text-sm text-brand"
            :class="isLUIMapVisible ? 'font-bold' : 'font-light'"
            @click="isLUIMapVisible = true"
          >
            顯示
          </button>
        </div>
      </div>
      <div class="pt-3">
        <SwitchMapModeButton :is-in-sheet="true" />
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="!isDesktop && isOpen"
      class="fixed inset-0 z-[80] bg-black/45"
      @click="isOpen = false"
    >
      <div
        data-testid="display-settings-sheet"
        class="absolute inset-x-0 bottom-0 bg-white px-4 pt-2 pb-6 shadow-2xl"
        @click.stop
      >
        <p class="py-2 text-sm text-brand-gray-light">地圖顯示設定</p>
        <div class="flex items-center justify-between gap-2 border-b border-black/5 py-3">
          <h2 class="text-base font-bold text-brand">農地範圍 •</h2>
          <div class="flex gap-1">
            <button
              type="button"
              class="rounded px-2 py-1 text-sm text-brand"
              :class="!isLUIMapVisible ? 'font-bold' : 'font-light'"
              @click="isLUIMapVisible = false"
            >
              隱藏
            </button>
            <button
              type="button"
              class="rounded px-2 py-1 text-sm text-brand"
              :class="isLUIMapVisible ? 'font-bold' : 'font-light'"
              @click="isLUIMapVisible = true"
            >
              顯示
            </button>
          </div>
        </div>
        <div class="pt-3">
          <SwitchMapModeButton :is-in-sheet="true" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
