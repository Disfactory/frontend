<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useDebounceFn, useMediaQuery } from '@vueuse/core'
import type Feature from 'ol/Feature'
import MapMarkerIcon from '@/components/MapMarkerIcon.vue'

import DisplaySettingBottomSheet from '@/components/DisplaySettingBottomSheet.vue'
import { getFactories } from '@/api'
import { initializeMap, getFactoryStatus, type MapFactoryController } from '@/lib/map'
import {
  defaultFactoryDisplayStatuses,
  getDisplayStatusColor,
  getDisplayStatusText,
  type FactoryDisplayStatusType,
} from '@/types'
import { useGA } from '@/lib/useGA'
import { moveToSharedFactory, permalink } from '@/lib/permalink'
import { useAppStore } from '@/stores/app'
import { useAlertStore } from '@/stores/alerts'
import { useMapStore } from '@/stores/map'

const appStore = useAppStore()
const mapStore = useMapStore()
const alertStore = useAlertStore()
const { event } = useGA()
const isDesktop = useMediaQuery('(min-width: 960px)')

const root = ref<HTMLElement | null>(null)
const appliedFilters = ref<FactoryDisplayStatusType[]>([...defaultFactoryDisplayStatuses])
const filterButtonsData = defaultFactoryDisplayStatuses.map((value) => ({
  text: getDisplayStatusText(value),
  color: getDisplayStatusColor(value),
  value,
}))

const checkActive = (status: FactoryDisplayStatusType) => appliedFilters.value.includes(status)

const onClickFilterButton = (status: FactoryDisplayStatusType) => {
  appliedFilters.value = checkActive(status)
    ? appliedFilters.value.filter((f) => f !== status)
    : [...appliedFilters.value, status]
  mapStore.setFilters(appliedFilters.value)
}

const zoomToGeolocation = () => {
  event('zoomToGeolocation')
  try {
    mapStore.zoomToGeolocation()
  } catch {
    alertStore.showAlert('您沒開放手機定位權限，\n請開放定位權限以用定位功能。')
  }
}

const onClickCreateFactoryButton = () => {
  mapStore.setLUIVisible(true)
  appStore.startCreateFactory()
}

let mapController: MapFactoryController | null = null

onMounted(() => {
  if (!root.value) return

  const onClickFactoryFeature = (_: [number, number], feature?: Feature) => {
    if (feature) {
      event('clickFactoryPin')
      const factoryId = feature.get('factoryId') as string | undefined
      if (factoryId) {
        const factory = mapController?.getFactory(factoryId)
        if (factory) {
          factory.feature = feature
          appStore.setFactoryData(factory)
          if (isDesktop.value) appStore.expandFactoryDetail()
        }
      } else {
        const geometry = feature.getGeometry()
        if (geometry && 'getCoordinates' in geometry) {
          const coordinates = (geometry as { getCoordinates: () => number[] }).getCoordinates()
          const view = mapController?.mapInstance.map.getView()
          view?.setCenter(coordinates)
          view?.setZoom((view.getZoom() ?? 0) + 1)
        }
      }
    } else {
      appStore.setFactoryData(null)
    }

    window.setTimeout(() => mapStore.updateSize(), 0)
  }

  const loadNewFactories = useDebounceFn(
    async (range: number, longitude: number, latitude: number) => {
      try {
        const factories = await getFactories(range, longitude, latitude)
        if (Array.isArray(factories)) mapController?.addFactories(factories)
      } catch (err) {
        console.error(err)
      }
    },
    500,
  )

    mapController = initializeMap(
    root.value,
    {
      onMoved: async ([longitude, latitude, range, zoom], canPlaceFactory) => {
        permalink.lat(latitude)
        permalink.lng(longitude)
        permalink.zoom(zoom)
        window.location.hash = permalink.dumps()

        appStore.canPlaceFactory = canPlaceFactory
        appStore.mapLngLat = [longitude, latitude]

        event('moveMap')
        await loadNewFactories(range, longitude, latitude)
      },
      onClicked: onClickFactoryFeature,
      onZoomed: (zoom) => {
        permalink.zoom(zoom)
        window.location.hash = permalink.dumps()
      },
    },
    {
      getInitialLocation() {
        permalink.load(window.location)
        if (permalink.dumps() !== '') {
          return [permalink.lng() as number, permalink.lat() as number, permalink.zoom() as number]
        }
        return undefined
      },
    },
  )

  mapStore.setController(mapController)
  mapStore.setLUIVisible(false)

  const controller = mapController
  if (!controller) return

  void moveToSharedFactory(controller, window.location, (factoryId) => {
    const factory = controller.getFactory(factoryId)
    if (!factory) return
    const feature = controller
      .getFactoriesLayerForStatus(getFactoryStatus(factory))
      .getFeatureById(factoryId)
    if (feature) onClickFactoryFeature([0, 0], feature as Feature)
  }).catch((err) => console.error('Unable to open shared factory', err))

  window.addEventListener('resize', onResize)
})

const onResize = () => mapStore.updateSize()

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  mapController?.mapInstance.map.setTarget(undefined)
  mapStore.setController(null)
})
</script>

<template>
  <div class="relative h-full w-full overflow-hidden">
    <div ref="root" class="h-full w-full" />

    <div
      v-if="appStore.isInitialPage"
      class="absolute inset-x-0 top-0 z-10 px-3 pt-3 pb-2"
      :class="appStore.factoryDetailsExpanded ? 'md:pr-[410px]' : ''"
    >
      <div class="flex gap-4 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
        <DisplaySettingBottomSheet />
        <button
          v-for="button in filterButtonsData"
          :key="String(button.value)"
          type="button"
          class="flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-brand shadow-md transition hover:bg-white/90"
          :class="checkActive(button.value) ? '' : 'opacity-50'"
          :name="button.text"
          @click="onClickFilterButton(button.value)"
        >
          <MapMarkerIcon class="size-6" :style="{ color: button.color }" />
          {{ button.text }}
        </button>
      </div>
    </div>

    <button
      type="button"
      class="absolute bottom-[185px] left-[21px] z-10 flex size-9 items-center justify-center rounded-lg bg-white shadow-md transition hover:bg-[#f5f5f5]"
      title="定位"
      data-label="map-locate"
      @click="zoomToGeolocation"
    >
      <img src="/images/locate.svg" alt="locate" class="size-5" />
    </button>

    <div
      v-if="appStore.selectFactoryMode"
      class="pointer-events-none absolute top-1/2 left-1/2 z-10 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-brand-red shadow"
    />

    <div v-if="!appStore.selectFactoryMode" class="absolute inset-x-0 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex justify-center">
      <button
        type="button"
        class="rounded-full bg-brand px-9 py-3 text-lg font-medium text-white shadow-lg transition hover:bg-brand/90"
        @click="onClickCreateFactoryButton"
      >
        我想新增可疑工廠
      </button>
    </div>
  </div>
</template>
