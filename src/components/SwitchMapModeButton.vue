<template>
  <v-bottom-sheet v-model="mapModeBottomSheet">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        :rounded="!isInSheet"
        :text="isInSheet"
        :class="isInSheet ? 'pa-0' : null"
        color="white"
        class="primary--text"
        v-bind="attrs"
        v-on="on"
      >
        切換地圖模式 • {{currentMapModeName}}
      </v-btn>
    </template>
    <v-list>
      <v-subheader>切換地圖模式</v-subheader>
      <v-list-item
        v-for="mode in mapModes"
        :key="mode.type"
        @click="currentMapMode = mode.type"
      >
        <v-list-item-title class="primary--text">{{ mode.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { defineComponent, ref, inject, computed } from 'vue'
import { BASE_MAP, BASE_MAP_NAME, MapFactoryController } from '@/lib/map'
import { MainMapControllerSymbol } from '@/symbols'
import { useMapMode } from '@/lib/useMapMode'

export default defineComponent({
  name: 'SwitchMapModeButton',
  props: {
    isInSheet: {
      type: Boolean,
      default: false
    }
  },
  setup () {
    const mapModeBottomSheet = ref(false)
    const mapController = inject(MainMapControllerSymbol, ref<MapFactoryController>())

    const { currentMapMode: currentMapMode$ } = useMapMode()
    const currentMapMode = computed({
      get: () => currentMapMode$.value,
      set: (value) => {
        currentMapMode$.value = value

        mapController.value?.mapInstance.changeBaseMap(value)
        mapModeBottomSheet.value = false
      }
    })

    const mapModes = [
      BASE_MAP.SATELITE,
      BASE_MAP.OSM,
      BASE_MAP.TAIWAN,
      BASE_MAP.PROTOMAP
    ].map(type => ({
      type,
      name: BASE_MAP_NAME[type]
    }))

    const currentMapModeName = computed(() =>
      mapModes.find((mode) => mode.type === currentMapMode.value)?.name ?? mapModes[0]?.name
    )

    return {
      mapModeBottomSheet,
      mapModes,
      currentMapMode,
      currentMapModeName
    }
  }
})
</script>
