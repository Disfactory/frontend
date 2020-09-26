<template>
  <v-bottom-sheet v-model="mapModeBottomSheet">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        rounded
        color="white"
        class="primary--text"
        v-bind="attrs"
        v-on="on"
      >
        切換地圖模式•簡易地圖
      </v-btn>
    </template>
    <v-list>
      <v-subheader>切換地圖模式</v-subheader>
      <v-list-item
        v-for="mode in mapModes"
        :key="mode.type"
        @click="clickChangeBaseLayer(mode)"
      >
        <v-list-item-title class="primary--text">{{ mode.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { createComponent, ref, inject } from '@vue/composition-api'
import { BASE_MAP, BASE_MAP_NAME, MapFactoryController } from '@/lib/map'
import { MainMapControllerSymbol } from '@/symbols'

export default createComponent({
  name: 'SwitchMapModeButto',
  setup () {
    const mapModeBottomSheet = ref(false)
    const mapController = inject(MainMapControllerSymbol, ref<MapFactoryController>())

    const mapModes = [BASE_MAP.SATELITE, BASE_MAP.OSM, BASE_MAP.TAIWAN].map(type => ({
      type,
      name: BASE_MAP_NAME[type]
    }))
    const clickChangeBaseLayer = (mode: { type: BASE_MAP, name: string }) => {
      if (mapController.value) {
        mapController.value?.mapInstance.changeBaseMap(mode.type)

        mapModeBottomSheet.value = false
      }
    }

    return {
      mapModeBottomSheet,
      mapModes,
      clickChangeBaseLayer
    }
  }
})
</script>
