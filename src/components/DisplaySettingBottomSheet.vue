<script setup lang="ts">
import { computed, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { ChevronDown } from '@lucide/vue'
import SwitchMapModeButton from '@/components/SwitchMapModeButton.vue'
import { useMapStore } from '@/stores/map'

const mapStore = useMapStore()
const isOpen = ref(false)
const panel = ref<HTMLElement | null>(null)

onClickOutside(panel, () => {
  isOpen.value = false
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
      class="flex items-center gap-1.5 rounded-full bg-brand px-3 py-2 text-sm font-medium text-white shadow-md"
      @click="isOpen = !isOpen"
    >
      顯示設定
      <ChevronDown class="size-4" :class="{ 'rotate-180': isOpen }" />
    </button>

    <div v-if="isOpen" class="absolute top-full left-0 z-20 mt-2 w-72 rounded-lg bg-white p-4 shadow-xl">
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-sm font-bold text-brand">農地範圍 •</h2>
        <div class="flex gap-1">
          <button
            type="button"
            class="rounded px-2 py-1 text-xs text-brand"
            :class="!isLUIMapVisible ? 'font-bold' : 'font-light'"
            @click="isLUIMapVisible = false"
          >
            隱藏
          </button>
          <button
            type="button"
            class="rounded px-2 py-1 text-xs text-brand"
            :class="isLUIMapVisible ? 'font-bold' : 'font-light'"
            @click="isLUIMapVisible = true"
          >
            顯示
          </button>
        </div>
      </div>
      <div class="mt-3 border-t pt-3">
        <SwitchMapModeButton :is-in-sheet="true" />
      </div>
    </div>
  </div>
</template>
