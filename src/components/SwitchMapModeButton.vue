<script setup lang="ts">
import { ref } from 'vue'
import { BASE_MAP, BASE_MAP_NAME } from '@/lib/map'
import { useMapStore } from '@/stores/map'

withDefaults(defineProps<{ isInSheet?: boolean }>(), { isInSheet: false })

const mapStore = useMapStore()
const isOpen = ref(false)

const mapModes = [BASE_MAP.SATELITE, BASE_MAP.OSM, BASE_MAP.TAIWAN, BASE_MAP.PROTOMAP].map((type) => ({
  type,
  name: BASE_MAP_NAME[type],
}))

const setMapMode = (mode: BASE_MAP) => {
  mapStore.changeBaseMap(mode)
  isOpen.value = false
}
</script>

<template>
  <div>
    <button
      type="button"
      class="text-sm font-medium text-brand"
      :class="isInSheet ? 'p-0 text-left' : 'rounded-full bg-white px-4 py-2 shadow-md'"
      @click="isOpen = true"
    >
      切換地圖模式 •
    </button>

    <Teleport to="body">
      <div
        class="fixed inset-0 z-[90] transition-opacity duration-200"
        :class="isOpen ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'"
      >
        <div class="absolute inset-0 bg-black/45" @click="isOpen = false" />

        <div
          class="absolute inset-x-0 bottom-0 bg-white px-4 pt-2 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-300 ease-out"
          :class="isOpen ? 'translate-y-0' : 'translate-y-full'"
        >
          <p class="py-2 text-sm text-brand-gray-light">切換地圖模式</p>
          <ul>
            <li v-for="mode in mapModes" :key="mode.type">
              <button
                type="button"
                class="block w-full px-2 py-3 text-left text-base text-brand transition hover:bg-black/5"
                @click="setMapMode(mode.type)"
              >
                {{ mode.name }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </div>
</template>
