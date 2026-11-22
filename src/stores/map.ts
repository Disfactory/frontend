import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { BASE_MAP, type MapFactoryController } from '@/lib/map'
import type { FactoryDisplayStatusType } from '@/types'

export const useMapStore = defineStore('map', () => {
  const controller = shallowRef<MapFactoryController | null>(null)
  const currentMapMode = ref<BASE_MAP>(BASE_MAP.OSM)
  const luiVisible = ref(false)
  const appliedFilters = ref<FactoryDisplayStatusType[]>([])

  function setController(value: MapFactoryController | null) {
    controller.value = value
  }

  function changeBaseMap(mode: BASE_MAP) {
    currentMapMode.value = mode
    controller.value?.mapInstance.changeBaseMap(mode)
  }

  function setLUIVisible(visible: boolean) {
    luiVisible.value = visible
    controller.value?.mapInstance.setLUILayerVisible(visible)
  }

  function toggleLUIVisible() {
    setLUIVisible(!luiVisible.value)
  }

  function setFilters(filters: FactoryDisplayStatusType[]) {
    appliedFilters.value = filters
    controller.value?.setFactoryStatusFilter(filters)
  }

  function updateSize() {
    controller.value?.mapInstance.map.updateSize()
  }

  function setCoordinate(lng: number, lat: number, zoom?: number) {
    controller.value?.mapInstance.setCoordinate(lng, lat, zoom)
  }

  function zoomToGeolocation() {
    controller.value?.mapInstance.zoomToGeolocation()
  }

  return {
    controller,
    currentMapMode,
    luiVisible,
    appliedFilters,
    setController,
    changeBaseMap,
    setLUIVisible,
    toggleLUIVisible,
    setFilters,
    updateSize,
    setCoordinate,
    zoomToGeolocation,
  }
})
