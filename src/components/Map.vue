<template>
  <div>
    <div class="map-container">
      <div ref="root" class="map"></div>

      <div ref="popup" :class="['popup', { show: popupState.show }]" :style="{ borderColor: popupData.color }">
        <div class="close" @click="popupState.show = false" data-label="map-popup-close" />
        <small :style="{ color: popupData.color }">{{ popupData.status }}</small>
        <h3>{{ popupData.name }}</h3>
        <p class="summary">{{ popupData.summary }}</p>
        <app-button outline @click="onClickEditFactoryData" :color="getButtonColorFromStatus()" data-label="map-popup-modify">
          補充資料
        </app-button>
      </div>

      <div class="ol-map-search ol-unselectable ol-control" @click="openFilterModal" data-label="map-search" v-show="!appState.selectFactoryMode">
        <button>
          <img src="/images/filter.svg" alt="search">
        </button>
      </div>

      <div class="ol-fit-location ol-unselectable ol-control" @click="zoomToGeolocation" data-label="map-locate">
        <button>
          <img src="/images/locate.svg" alt="locate">
        </button>
      </div>

      <div class="center-point" v-if="appState.selectFactoryMode && !locationTooltipVisibility" />

      <div class="factory-button-group">
        <div class="create-factory-button" v-if="!appState.selectFactoryMode">
          <app-button @click="onClickCreateFactoryButton" data-label="map-create-factory" color="dark-green">我想新增可疑工廠</app-button>
        </div>
      </div>

      <div>
        <v-card elevation="3" class="factory-container" :class="{full}">
          <v-card-text>
            <div>
              <span class="float-left body-2">工廠狀態</span>
              <v-icon class="float-right" @click="onClickFull">mdi-close</v-icon>
              <v-icon class="float-right">mdi-share-variant</v-icon>
            </div>
            <p class="headline text--primary" style="clear: both">
              <v-icon>mdi-map-marker</v-icon>等待被舉報
            </p>
            <p class="caption">
              工廠編號 HK4FD2 <br>
              最後更新 2020/4/12
            </p>
          </v-card-text>
          <v-slide-group>
            <v-slide-item class="mr-4">
              <img src="https://picsum.photos/120/68" alt="">
            </v-slide-item>
            <v-slide-item class="mr-4">
              <img src="https://picsum.photos/120/68" alt="">
            </v-slide-item>
            <v-slide-item class="mr-4">
              <img src="https://picsum.photos/120/68" alt="">
            </v-slide-item>
            <v-slide-item class="mr-4">
              <img src="https://picsum.photos/120/68" alt="">
            </v-slide-item>
          </v-slide-group>
          <div class="mt-4 ml-3">
            <h3 class="text-h5">地段 / 地址</h3>
            <p>台中市大雅區自強段（701）7 地號</p>

            <div v-if="full">
              <h3 class="text-h5">經緯度</h3>
              <p>12.345678, 12.34567890</p>
              <p class="text-caption">以上經緯度版本為 WGS84</p>
            </div>

            <hr v-if="full">
            <p class="text-body-1 ml-3" @click="onClickFull" v-if="!full">顯示更多資訊</p>

            <div v-if="full" class="mt-4">
              <h2 class="text-h4 mb-5">其他工廠資訊</h2>
              <h3 class="text-h5">工廠外部文字</h3>
              <p class="mb-2">XXX 公司</p>

              <h3 class="text-h5">工廠類型</h3>
              <p class="mb-2">金屬：車床</p>
            </div>
          </div>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import AppButton from '@/components/AppButton.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppTextField from '@/components/AppTextField.vue'
import { createComponent, onMounted, ref, inject, computed } from '@vue/composition-api'
import { initializeMap, MapFactoryController, getFactoryStatus } from '../lib/map'
import { getFactories } from '../api'
import { MainMapControllerSymbol } from '../symbols'
import { Overlay } from 'ol'
import OverlayPositioning from 'ol/OverlayPositioning'
import { FactoryStatus } from '../types'
import { useGA } from '@/lib/useGA'
import { useModalState } from '../lib/hooks'
import { useFactoryPopup, getPopupData } from '../lib/factoryPopup'
import { useAppState } from '../lib/appState'
import { useAlertState } from '../lib/useAlert'
import { permalink } from '../lib/permalink'

export default createComponent({
  components: {
    AppButton,
    AppNavbar,
    AppTextField
  },
  props: {
    setFactoryLocation: {
      type: Function,
      required: true
    },
    openFilterModal: {
      type: Function,
      required: true
    }
  },
  setup () {
    const full = ref(false)

    const { event } = useGA()
    const root = ref<HTMLElement>(null)
    const popup = ref<HTMLDivElement>(null)
    const mapControllerRef = inject(MainMapControllerSymbol, ref<MapFactoryController>())

    const [, modalActions] = useModalState()
    const [appState, { openEditFactoryForm, pageTransition }] = useAppState()
    const [, alertActions] = useAlertState()

    const [popupState] = useFactoryPopup()
    const popupData = computed(() => appState.factoryData ? getPopupData(appState.factoryData) : {})

    const setPopup = (id: string) => {
      if (!mapControllerRef.value) return
      const factory = mapControllerRef.value.getFactory(id)

      if (factory) {
        appState.factoryData = factory
        popupState.show = true
      }
    }

    const onClickFull = () => {
      full.value = !full.value
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
            event('clickPopup')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            popupOverlay.setPosition((feature.getGeometry() as any).getCoordinates())
            setPopup(feature.getId() as string)
          } else {
            popupState.show = false
          }
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

    function onClickCreateFactoryButton () {
      if (!mapControllerRef.value) return

      mapControllerRef.value.mapInstance.setLUILayerVisible(true)

      pageTransition.startCreateFactory()

      popupState.show = false
    }

    return {
      full,
      onClickFull,
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
      popupState,
      popupData,
      onClickEditFactoryData,
      getButtonColorFromStatus: function () {
        if (!appState.factoryData) {
          return 'default'
        }

        const status = getFactoryStatus(appState.factoryData)
        return {
          [FactoryStatus.NEW]: 'blue',
          [FactoryStatus.EXISTING_INCOMPLETE]: 'gray',
          [FactoryStatus.EXISTING_COMPLETE]: 'gray',
          [FactoryStatus.REPORTED]: 'default'
        }[status]
      },
      onClickCreateFactoryButton
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
  bottom: 60px;
  display: flex;

  flex-direction: column;
  justify-content: center;

  .create-factory-button {
    max-width: 250px;
    margin: 0 auto;
  }

  .choose-location-button {
    position: relative;
    margin: 0 auto;
  }
}

.factory-secondary-actions-group {
  max-width: 300px;
  margin: 0 auto;

  display: flex;
  margin-bottom: 10px;
  justify-content: center;

  .ol-control:last-child {
    margin-left: 5px;
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

.location-tooltip {
  position: fixed;
  top: 50%;
  left: 50vw;

  z-index: 2;

  .circle {
    position: absolute;
    background-color: $dark-green-color;

    transform: translate(-12.5px, 12.5px);

    width: 25px;
    height: 25px;
    border-radius: 50%;
    display: block;
    border: solid 1px white;
  }

  .line {
    width: 4px;
    height: 60px;
    background-color: $dark-green-color;
    border-width: 0 1px;
    border-style: solid;
    border-color: white;

    position: absolute;
    transform: translate(-2px, -46px);
  }

  .box {
    width: 287px;
    height: 85px;
    background-color: $dark-green-color;
    color: white;
    padding: 12px 18px;
    border: solid 1px white;

    transform: translate(-143.5px, -130px);

    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
    }

    small {
      margin-top: 1em;
    }
  }

  .box-input {
    height: auto;
    transform: translate(-143.5px, -200px);

    label {
      font-size: 14px;
    }

    input {
      margin-top: 5px;
    }

    & > div:not(:last-child) {
      margin-bottom: 15px;
    }
  }
}

.location-tooltip-backdrop {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.5);
}

@keyframes fadein {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.popup {
  display: none;
  opacity: 0;
  animation-name: fadein;
  animation-duration: 500ms;
  transform: translate(-17px, -18px);
  border-radius: 3px;
  border: solid 3px #a22929;
  background-color: #ffffff;
  min-width: 240px;
  padding: 20px;
  position: relative;

  .close {
    @include close-button;
  }

  h3 {
    width: calc(100% - 24px);
    margin: 0;
    font-size: 20px;
    line-height: 1.8;
  }

  p {
    margin: 5px 0;
    font-size: 14px;
    line-height: 2;
  }

  p.summary {
    white-space: pre-wrap;
    margin-bottom: 15px;
    font-size: 14px;
    font-weight: 500;
  }
}

.popup.show {
  display: block;
  opacity: 1;
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

.factory-container {
  height: 50%;
  position: absolute;
  bottom: 0;
  width: 100%;
}

.factory-container.full {
  height: 100%;
}

</style>
