<template>
  <div class="map-container">
    <div ref="root" class="map"></div>

    <div class="container-fluid px-1 pt-7 pb-4 filter-buttons-container" :class="{ desktop: $vuetify.breakpoint.mdAndUp, 'sidebar-expanded': appState.factoryDetailsExpanded }" v-if="appState.isInitialPage">
      <display-setting-bottom-sheet />
      <v-btn class="mx-2 mb-5 primary--text" v-for="button in filterButtonsData" :key="button.value" @click="onClickFilterButton(button.value)" rounded :class="{ 'v-btn--active': checkActive(button.value) }" color="white">
        <v-icon :color="button.color">mdi-map-marker</v-icon>
        {{ button.text }}
      </v-btn>
    </div>

    <div class="ol-fit-location ol-unselectable ol-control" @click="zoomToGeolocation" data-label="map-locate">
      <button>
        <img src="/images/locate.svg" alt="locate">
      </button>
    </div>

    <div class="center-point" v-if="appState.selectFactoryMode && !locationTooltipVisibility" />

    <div class="factory-button-group flex justify-center mb-5 mb-8-md" v-if="!appState.selectFactoryMode">
      <v-btn @click="onClickCreateFactoryButton" color="primary" rounded large>
        我想新增可疑工廠
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { createComponent, onMounted, onUnmounted, ref, inject } from '@vue/composition-api'

import AppButton from '@/components/AppButton.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppTextField from '@/components/AppTextField.vue'
import DisplaySettingBottomSheet from '@/components/DisplaySettingBottomSheet.vue'

import { initializeMap, MapFactoryController } from '../lib/map'
import { getFactories } from '../api'
import { MainMapControllerSymbol } from '../symbols'
import { Overlay } from 'ol'
import OverlayPositioning from 'ol/OverlayPositioning'
import { defaultFactoryDisplayStatuses, FactoryDisplayStatusType, getDisplayStatusColor, getDisplayStatusText } from '../types'
import { useGA } from '@/lib/useGA'
import { useModalState } from '../lib/hooks'
import { useAppState } from '../lib/appState'
import { useAlertState } from '../lib/useAlert'
import { permalink } from '../lib/permalink'
import { waitNextTick } from '../lib/utils'

export default createComponent({
  components: {
    AppButton,
    AppNavbar,
    AppTextField,
    DisplaySettingBottomSheet
  },
  props: {
    setFactoryLocation: {
      type: Function,
      required: true
    }
  },
  setup (props, context) {
    const { event } = useGA()
    const root = ref<HTMLElement>(null)
    const popup = ref<HTMLDivElement>(null)
    const mapControllerRef = inject(MainMapControllerSymbol, ref<MapFactoryController>())

    const [, modalActions] = useModalState()
    const [appState, { openEditFactoryForm, pageTransition, expandFactoryDetail }] = useAppState()
    const [, alertActions] = useAlertState()

    const openFactoryDetail = (id: string) => {
      if (!mapControllerRef.value) return
      const factory = mapControllerRef.value.getFactory(id)

      if (factory) {
        appState.factoryData = factory
      }
    }

    const resizeMap = function () {
      if (mapControllerRef.value) {
        mapControllerRef.value.mapInstance.map.updateSize()
      }
    }

    const onClickEditFactoryData = () => {
      if (!appState.factoryData) {
        return
      }

      openEditFactoryForm(appState.factoryData)
    }

    onMounted(() => {
      const popupOverlay = new Overlay({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        element: popup.value!,
        positioning: OverlayPositioning.BOTTOM_LEFT
      })

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const mapController = initializeMap(root.value!, {
        onMoved: async function ([longitude, latitude, range, zoom], canPlaceFactory) {
          permalink.lat(latitude)
          permalink.lng(longitude)
          permalink.zoom(zoom)
          window.location.hash = permalink.dumps()

          appState.canPlaceFactory = canPlaceFactory
          appState.mapLngLat = [longitude, latitude]

          event('moveMap')
          try {
            const factories = await getFactories(range, longitude, latitude)
            if (Array.isArray(factories)) {
              mapController.addFactories(factories)
            }
          } catch (e) {
            // TODO: handle here
          }
        }, // TODO: do on start move to lock selection
        onClicked: async function (_, feature) {
          if (feature) {
            event('clickFactoryPin')
            openFactoryDetail(feature.getId() as string)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((context.root as any).$vuetify.breakpoint.mdAndUp) {
              expandFactoryDetail()
            }
          } else {
            appState.factoryData = null
          }
          await waitNextTick(context)
          resizeMap()
        },
        onZoomed: function (zoom) {
          permalink.zoom(zoom)
          window.location.hash = permalink.dumps()
        }
      }, {
        getInitialLocation: function () {
          permalink.load(window.location)

          if (permalink.dumps() !== '') {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return [permalink.lng()!, permalink.lat()!, permalink.zoom()!]
          }
        }
      })

      mapController.mapInstance.map.addOverlay(popupOverlay)
      mapControllerRef.value = mapController

      mapController.mapInstance.setLUILayerVisible(false)
    })

    onMounted(() => {
      window.addEventListener('resize', resizeMap)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', resizeMap)
    })

    function onClickCreateFactoryButton () {
      if (!mapControllerRef.value) return

      mapControllerRef.value.mapInstance.setLUILayerVisible(true)

      pageTransition.startCreateFactory()
    }

    const appliedFilters = ref<FactoryDisplayStatusType[]>([])
    const checkActive = (status: FactoryDisplayStatusType) => appliedFilters.value.includes(status)

    const onClickFilterButton = (status: FactoryDisplayStatusType) => {
      if (!mapControllerRef.value) {
        return
      }

      if (checkActive(status)) {
        appliedFilters.value = appliedFilters.value.filter(f => f !== status)
      } else {
        appliedFilters.value = [
          ...appliedFilters.value,
          status
        ]
      }

      mapControllerRef.value.setFactoryStatusFilter(appliedFilters.value)
    }

    const filterButtonsData = defaultFactoryDisplayStatuses.map(v => ({
      text: getDisplayStatusText(v),
      color: getDisplayStatusColor(v),
      value: v
    }))

    return {
      root,
      modalActions,
      popup,
      zoomToGeolocation: function () {
        if (mapControllerRef.value) {
          event('zoomToGeolocation')
          try {
            mapControllerRef.value.mapInstance.zoomToGeolocation()
          } catch (err) {
            alertActions.showAlert('您沒開放手機定位權限， \n請開放定位權限以用定位功能。')
          }
        }
      },
      appState,
      onClickEditFactoryData,
      onClickCreateFactoryButton,
      onClickFilterButton,
      filterButtonsData,
      checkActive,
      appliedFilters
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~@/styles/variables';
@import '~@/styles/utils';

.map-container {
  top: 0;
  bottom: 0;
  width: 100vw;
  height: 100%;
  position: absolute;

  .ol-switch-base, .ol-switch-luilayer-visibility {
    background: #6E8501;
    position: relative;
    width: auto;
    height: auto;
    text-align: center;
    display: inline-block;

    button {
      display: inline-block;
      width: auto;
      font-size: 14px;
    }
  }
}

.map {
  height: 100%;
}

.factory-button-group {
  position: fixed;
  width: 100%;
  left: 0;
  bottom: 0px;

  .v-btn.v-size--large {
    font-size: 24px;
    height: 48px;
    padding: 0 35px;
  }
}

.center-point {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: block;
  background-color: $red-color;
  border: solid 1px white;

  position: fixed;
  top: 50%;
  left: 0;
  z-index: 2;

  transform: translate(calc(50vw - 12.5px), 12.5px);
}

.navbar-container {
  position: absolute;
  top: -47px;
  left: 0;
  z-index: 5;
}

.region-alert {
  user-select: none;
  position: absolute;
  top: 0;
  left: 0;

  background-color: #6E8501;
  color: white;
  width: 100%;
  padding: 10px 20px;
  font-size: 14px;
  line-height: 19px;
}

.filter-buttons-container {
  position: absolute;
  top: 0;
  overflow-x: auto;
  max-width: 100%;
  white-space: nowrap;

  &.desktop {
    white-space: normal;
  }

  &.sidebar-expanded {
    max-width: calc(100% - 395px);
  }
}
</style>
