<template>
  <div class="create-factory-steps">
    <v-app-bar
      fixed
      color="white"
    >
      <div class="btn-container" :class="{ hide: appState.createStepIndex === 1 }">
        <v-btn icon @click="onBack">
          <v-icon>mdi-keyboard-backspace</v-icon>
        </v-btn>
      </div>

      <v-spacer></v-spacer>
      <v-toolbar-title>新增可疑工廠 步驟 ({{ appState.createStepIndex }}/3)</v-toolbar-title>
      <v-spacer></v-spacer>

      <div class="btn-container">
        <v-dialog v-model="discardDialog" max-width="290">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-on="on" v-bind="attrs">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="headline">放棄新增可疑工廠嗎？</v-card-title>
            <v-card-text>放棄新增可疑工廠時，你將遺失所有已輸入的資料。下次需重新填寫。</v-card-text>
            <v-container class="text-center">
              <v-btn width="100%" x-large rounded color="green darken-1" @click="discardDialog = false">繼續填寫資料</v-btn>
              <a class="d-block mt-4" @click="cancelCreateFactory">放棄新增</a>
            </v-container>
          </v-card>
        </v-dialog>
      </div>

    </v-app-bar>

    <div class="create-factory-step-1" v-if="appState.createStepIndex === 1">
      <div class="select-location-container container-fluid pa-3" v-if="showLongLat">
        <p>以下經緯度版本為WGS84</p>
        <div class='d-flex d-flex align-end justify-space-between'>
          <p class='font-weight-medium h5 mb-0'>
            經度：{{ appState.mapLngLat[0].toFixed(7) }}
            <br>
            緯度：{{ appState.mapLngLat[1].toFixed(7) }}
          </p>

          <v-dialog v-model="chooseLocationDialog" max-width="290">
            <template v-slot:activator="{ on, attrs }">
              <v-btn rounded color="white" class="mr-2" v-on="on" v-bind="attrs" >
                搜尋經緯度
              </v-btn>
            </template>
            <v-card outlined>
              <v-card-text class="pt-4">
                <p>
                  以下經緯度版本為WGS84
                </p>

                <h3 class="mb-2">精度</h3>

                <v-text-field outilned solo v-model="locationInputState.longitude" placeholder="例：121.5231872" />

                <h3 class="mb-2">緯度</h3>

                <v-text-field outilned solo v-model="locationInputState.latitude" placeholder="例：25.0458344" />
                <div class="d-flex justify-space-between mt-3 align-end">
                  <a class="text-decoration-underline" style="height: 36px; line-height: 36px;" @click="clearLocationInput">清空</a>
                  <v-btn rounded color="white" @click="setLocation">定位</v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-dialog>

        </div>
      </div>

      <div class="px-5 py-4">
        <v-btn rounded color="white" class="mr-2" @click="toggleShowLongLat">
          {{ showLongLat ? '隱藏經緯度' : '顯示經緯度' }}
        </v-btn>

        <switch-map-mode-button />

        <v-container fluid class="choose-location-btn-container d-flex justify-center" bottom="50">
          <v-btn x-large rounded @click="chooseLocation">
            選擇此地點
          </v-btn>
        </v-container>
      </div>

    </div>

    <image-upload-form
      v-if="appState.createStepIndex === 2"
      v-model="selectedImages"
      :uploading="imageUploadState.uploading"
      :error="imageUploadState.error"
      :previewImages="uploadedImages"
      :onClickRemoveImage="onClickRemoveImage"
      :valid="imageUploadFormValid"
      :submit="pageTransition.gotoNextCreate"
      :formState="formState"
    />

    <confirm-factory
      v-if="appState.createStepIndex === 3"
      :formState="formState"
      :previewImages="uploadedImages"
      :submit="submitFactory"
    />

  </div>
</template>

<script lang="ts">
import { createComponent, inject, ref, watch, reactive, computed } from '@vue/composition-api'

import { useAppState } from '../lib/appState'
import { useAlertState } from '../lib/useAlert'

import { MainMapControllerSymbol } from '../symbols'
import { MapFactoryController } from '../lib/map'
import { uploadImages, UploadedImage, createFactory } from '../api'

import ImageUploadForm from './ImageUploadForm.vue'
import ConfirmFactory from './ConfirmFactory.vue'
import SwitchMapModeButton from './SwitchMapModeButton.vue'
import { FactoryPostData, FactoryType } from '../types'
import { useGA } from '../lib/useGA'
import { useBackPressed } from '../lib/useBackPressed'

export default createComponent({
  name: 'CreateFactorySteps',
  components: {
    ImageUploadForm,
    ConfirmFactory,
    SwitchMapModeButton
  },
  setup () {
    const [appState, { pageTransition, setFactoryLocation }] = useAppState()
    const [, alertActions] = useAlertState()
    const { event } = useGA()

    const discardDialog = ref(false)

    const mapController = inject(MainMapControllerSymbol, ref<MapFactoryController>())

    function cancelCreateFactory () {
      if (mapController.value) {
        mapController.value.mapInstance.setLUILayerVisible(false)
        discardDialog.value = false
        // TODO: clear form value
        pageTransition.closeFactoryPage()
      }
    }

    const onBack = () => {
      if (appState.createStepIndex === 1) {
        cancelCreateFactory()
      } else if (appState.createStepIndex === 2) {
        if (mapController.value) {
          mapController.value.mapInstance.setLUILayerVisible(true)
          pageTransition.previousCreateStep()
        }
      } else {
        pageTransition.previousCreateStep()
      }
    }
    useBackPressed(onBack)

    const createFactoryFormState = reactive({
      nickname: '',
      contact: '',
      others: '',
      name: '',
      type: '0',
      submitting: false
    })

    const uploadedImages = ref<UploadedImage[]>([])
    const imageUploadState = reactive({
      error: null as boolean | null,
      uploading: false
    })

    const selectedImages = ref<FileList>(null)
    watch(selectedImages, () => {
      imageUploadState.error = null

      if (!selectedImages.value) {
        return
      }

      imageUploadState.uploading = true

      uploadImages(selectedImages.value).then(images => {
        uploadedImages.value = [
          ...uploadedImages.value,
          ...images
        ]
      }).catch(err => {
        console.error(err)
        imageUploadState.error = true
      }).finally(() => {
        imageUploadState.uploading = false
      })
    })

    const onClickRemoveImage = ({ src }: UploadedImage) => {
      uploadedImages.value = uploadedImages.value.filter(image => image.src !== src)
    }

    const imageUploadFormValid = computed(() => uploadedImages.value.length > 0 && !imageUploadState.uploading)

    const submitFactory = async () => {
      createFactoryFormState.submitting = true

      try {
        const [lng, lat]: number[] = appState.factoryLocation
        const factory: FactoryPostData = {
          name: createFactoryFormState.name,
          others: createFactoryFormState.others,
          type: createFactoryFormState.type as FactoryType,
          lng,
          lat,
          images: uploadedImages.value.map(i => i.token),
          nickname: createFactoryFormState.nickname,
          contact: createFactoryFormState.contact
        }

        event('createFactory', { lng, lat })
        const resultFactory = await createFactory(factory)
        if (mapController.value) {
          mapController.value.addFactories([resultFactory])
        }
      } catch (e) {
        // TODO: handle create failure
      } finally {
        createFactoryFormState.submitting = false
      }

      // TODO: if error, don't close factory page
      pageTransition.closeFactoryPage()
    }

    const showLongLat = ref(false)
    const toggleShowLongLat = () => {
      showLongLat.value = !showLongLat.value
    }

    const chooseLocationDialog = ref(false)
    const locationInputState = reactive({
      longitude: '',
      latitude: ''
    })
    const clearLocationInput = () => {
      locationInputState.longitude = ''
      locationInputState.latitude = ''
    }
    const setLocation = () => {
      if (!mapController.value) return

      const lng = parseFloat(locationInputState.longitude)
      const lat = parseFloat(locationInputState.latitude)
      if (!locationInputState.longitude ||
          !locationInputState.latitude ||
          isNaN(lng) ||
          isNaN(lat)
      ) {
        // TODO: show invalid input error
        chooseLocationDialog.value = false
      } else {
        let zoom = mapController.value.mapInstance.map.getView().getZoom()
        if (!zoom || zoom <= 17) {
          zoom = 17
        }
        mapController.value.mapInstance.setCoordinate(lng, lat, zoom)
        chooseLocationDialog.value = false
      }
    }

    return {
      appState,
      pageTransition,
      formState: createFactoryFormState,

      cancelCreateFactory,
      onBack,
      chooseLocation () {
        if (!mapController.value) return

        if (!appState.canPlaceFactory) {
          alertActions.showAlert('此地點不在農地範圍內，\n請回報在農地範圍內的工廠。')
          return
        }

        mapController.value.mapInstance.setLUILayerVisible(false)

        setFactoryLocation(appState.mapLngLat as [number, number])

        pageTransition.nextCreateStep()
      },
      selectedImages,
      imageUploadState,
      uploadedImages,
      onClickRemoveImage,
      imageUploadFormValid,
      discardDialog,
      submitFactory,
      showLongLat,
      toggleShowLongLat,
      chooseLocationDialog,
      locationInputState,
      clearLocationInput,
      setLocation
    }
  }
})
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.btn-container.hide {
  visibility: hidden;
  pointer-events: none;
}

.create-factory-steps {
  width: 100%;
  height: 100%;

  .create-factory-step-1 {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;

    .choose-location-btn-container {
      position: fixed;
      bottom: 50px;
    }
  }

  .select-location-container {
    background-color: $light-green-color;
    color: white;
  }
}
</style>
