<script setup lang="ts">
import { computed, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { ChevronDown } from '@lucide/vue'
import { BASE_MAP, BASE_MAP_NAME } from '@/lib/map'
import { useMapStore } from '@/stores/map'

withDefaults(defineProps<{ isInSheet?: boolean }>(), { isInSheet: false })

const mapStore = useMapStore()
const isOpen = ref(false)
const root = ref<HTMLElement | null>(null)

const mapModes = [BASE_MAP.SATELITE, BASE_MAP.OSM, BASE_MAP.TAIWAN, BASE_MAP.PROTOMAP].map((type) => ({
  type,
  name: BASE_MAP_NAME[type],
}))

const currentMapModeName = computed(
  () => mapModes.find((mode) => mode.type === mapStore.currentMapMode)?.name ?? mapModes[0]?.name,
)

const setMapMode = (mode: BASE_MAP) => {
  mapStore.changeBaseMap(mode)
  isOpen.value = false
}

onClickOutside(root, () => {
  isOpen.value = false
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex items-center gap-1 text-sm font-medium text-brand"
      :class="isInSheet ? 'p-0' : 'rounded-full bg-white px-3 py-2 shadow-md'"
      @click="isOpen = !isOpen"
    >
      切換地圖模式 • {{ currentMapModeName }}
      <ChevronDown class="size-4" :class="{ 'rotate-180': isOpen }" />
    </button>

    <div
      v-if="isOpen"
      class="mt-2 w-full rounded-lg bg-white p-2 shadow-xl"
      :class="isInSheet ? 'border' : 'absolute top-full left-0 z-30 w-48'"
    >
      <button
        v-for="mode in mapModes"
        :key="mode.type"
        type="button"
        class="block w-full rounded px-3 py-2 text-left text-sm text-brand transition hover:bg-brand/10"
        :class="{ 'font-bold': mode.type === mapStore.currentMapMode }"
        @click="setMapMode(mode.type)"
      >
        {{ mode.name }}
      </button>
    </div>
  </div>
</template>
