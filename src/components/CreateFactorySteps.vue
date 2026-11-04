<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ArrowLeft, ChevronRight, X } from '@lucide/vue'
import AppButton from './AppButton.vue'
import AppModal from './AppModal.vue'
import AppTextField from './AppTextField.vue'
import ImageUploadForm from './ImageUploadForm.vue'
import ConfirmFactory from './ConfirmFactory.vue'
import SwitchMapModeButton from './SwitchMapModeButton.vue'
import { useAppStore } from '@/stores/app'
import { useAlertStore } from '@/stores/alerts'
import { useModalStore } from '@/stores/modals'
import { useMapStore } from '@/stores/map'
import { useGA } from '@/lib/useGA'
import { useBackPressed } from '@/lib/useBackPressed'
import { useImageUpload } from '@/lib/imageUpload'
import { createFactory } from '@/api'
import type { FactoryPostData, FactoryType } from '@/types'

const appStore = useAppStore()
const modalStore = useModalStore()
const alertStore = useAlertStore()
const mapStore = useMapStore()
const { event } = useGA()

const discardDialog = ref(false)
const showLongLat = ref(false)
const inlineLocationForm = ref(false)
const locationInputState = reactive({ longitude: '', latitude: '' })

const formState = reactive({
  nickname: '',
  contact: '',
  others: '',
  name: '',
  type: undefined as FactoryType | undefined,
  submitting: false,
})

const {
  selectedImages,
  imageUploadState,
  uploadedImages,
  onClickRemoveImage,
  imageUploadFormValid,
} = useImageUpload()

const cancelCreateFactory = () => {
  mapStore.setLUIVisible(false)
  discardDialog.value = false
  appStore.cancelCreateFactory()
}

const onBack = () => {
  if (appStore.createStepIndex === 1) {
    cancelCreateFactory()
  } else if (appStore.createStepIndex === 2) {
    mapStore.setLUIVisible(true)
    appStore.previousCreateStep()
  } else {
    appStore.previousCreateStep()
  }
}
useBackPressed(onBack)

const switchStep = (num: number) => {
  const backSteps = appStore.createStepIndex - num
  for (let i = 0; i < backSteps; i++) onBack()
}

const chooseLocation = () => {
  if (!appStore.canPlaceFactory) {
    alertStore.showAlert('此地點不在農地範圍內，\n請回報在農地範圍內的工廠。')
    return
  }
  mapStore.setLUIVisible(false)
  appStore.setFactoryLocation(appStore.mapLngLat as [number, number])
  appStore.nextCreateStep()
}

const clearLocationInput = () => {
  locationInputState.longitude = ''
  locationInputState.latitude = ''
}

const setLocation = () => {
  const lng = parseFloat(locationInputState.longitude)
  const lat = parseFloat(locationInputState.latitude)
  if (!locationInputState.longitude || !locationInputState.latitude || isNaN(lng) || isNaN(lat)) return
  const view = mapStore.controller?.mapInstance.map.getView()
  const zoom = !view?.getZoom() || (view.getZoom() ?? 0) <= 17 ? 17 : view.getZoom()
  mapStore.setCoordinate(lng, lat, zoom ?? 17)
}

const submitFactory = async () => {
  formState.submitting = true
  try {
    const [lng, lat] = appStore.factoryLocation
    const factory: FactoryPostData = {
      name: formState.name,
      others: formState.others,
      type: formState.type,
      lng: lng as number,
      lat: lat as number,
      images: uploadedImages.value.map((i) => i.token),
      nickname: formState.nickname,
      contact: formState.contact,
    }
    event('createFactory', { lng, lat })
    const resultFactory = await createFactory(factory)
    mapStore.controller?.addFactories([resultFactory])
  } catch (err) {
    console.error(err)
  } finally {
    formState.submitting = false
  }

  appStore.closeFactoryPage()
  modalStore.openCreateFactorySuccessModal()
}
</script>

<template>
  <div class="pointer-events-none absolute inset-0 z-20">
    <header class="pointer-events-auto flex h-14 items-center justify-between border-b bg-white px-3 text-brand-dark">
      <button
        type="button"
        class="rounded p-2 hover:bg-black/5"
        :class="{ invisible: appStore.createStepIndex === 1 }"
        aria-label="返回"
        @click="onBack"
      >
        <ArrowLeft class="size-5" />
      </button>

      <h1 class="text-base font-medium md:hidden">新增可疑工廠 步驟 ({{ appStore.createStepIndex }}/3)</h1>

      <div class="hidden items-center gap-3 md:flex">
        <h1 class="text-lg font-medium">新增可疑工廠</h1>
        <button
          type="button"
          class="flex items-center gap-1 text-sm"
          :class="appStore.createStepIndex >= 1 ? '' : 'opacity-50'"
          @click="switchStep(1)"
        >
          選擇工廠位置 <ChevronRight class="size-4" />
        </button>
        <button
          type="button"
          class="flex items-center gap-1 text-sm"
          :class="appStore.createStepIndex >= 2 ? '' : 'pointer-events-none opacity-50'"
          @click="switchStep(2)"
        >
          上傳工廠照片 <ChevronRight class="size-4" />
        </button>
        <button
          type="button"
          class="text-sm"
          :class="appStore.createStepIndex >= 3 ? '' : 'pointer-events-none opacity-50'"
          @click="switchStep(3)"
        >
          確認及補充工廠資訊
        </button>
      </div>

      <button type="button" class="rounded p-2 hover:bg-black/5" aria-label="取消新增" @click="discardDialog = true">
        <X class="size-5" />
      </button>
    </header>

    <template v-if="appStore.createStepIndex === 1">
      <div class="pointer-events-auto absolute inset-x-0 top-14 bg-brand px-4 py-3 text-white md:px-10">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
            <p class="text-xs md:text-sm">以下經緯度版本為 WGS84</p>
            <template v-if="!inlineLocationForm">
              <p class="text-sm font-medium md:text-base">經度：{{ appStore.mapLngLat[0]?.toFixed(7) }}</p>
              <p class="text-sm font-medium md:text-base">緯度：{{ appStore.mapLngLat[1]?.toFixed(7) }}</p>
              <button
                type="button"
                class="hidden rounded-full bg-white px-4 py-2 text-sm font-medium text-brand md:block"
                @click="inlineLocationForm = true"
              >
                搜尋經緯度
              </button>
            </template>

            <div v-else class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-medium">搜尋經緯度</span>
              <span class="hidden h-9 w-px bg-white/40 md:block" />
              <label class="text-sm">經度</label>
              <AppTextField v-model="locationInputState.longitude" placeholder="例：121.5231872" small class="w-40" />
              <label class="text-sm">緯度</label>
              <AppTextField v-model="locationInputState.latitude" placeholder="例：25.0458344" small class="w-40" />
              <button type="button" class="text-sm underline" @click="clearLocationInput">清空</button>
              <button type="button" class="rounded-full bg-white px-4 py-2 text-sm font-medium text-brand" @click="setLocation">
                定位
              </button>
              <button type="button" class="rounded p-1 text-white hover:bg-white/10" @click="inlineLocationForm = false">
                <X class="size-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            class="rounded-full bg-white px-4 py-2 text-sm font-medium text-brand md:hidden"
            @click="inlineLocationForm = true"
          >
            搜尋經緯度
          </button>
        </div>

        <div v-if="inlineLocationForm" class="mt-3 flex flex-wrap items-end gap-2 md:hidden">
          <div>
            <h3 class="mb-1 text-sm">經度</h3>
            <AppTextField v-model="locationInputState.longitude" placeholder="例：121.5231872" small class="w-40" />
          </div>
          <div>
            <h3 class="mb-1 text-sm">緯度</h3>
            <AppTextField v-model="locationInputState.latitude" placeholder="例：25.0458344" small class="w-40" />
          </div>
          <button type="button" class="rounded-full bg-white px-4 py-2 text-sm font-medium text-brand" @click="setLocation">
            定位
          </button>
        </div>
      </div>

      <div class="pointer-events-auto absolute inset-x-0 bottom-0 bg-white/95 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div class="mb-2 flex justify-center md:hidden">
          <AppButton class="max-w-[345px]" color="dark-green" @click="chooseLocation">選擇此地點</AppButton>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="rounded-full bg-white px-3 py-2 text-sm font-medium text-brand shadow"
            @click="showLongLat = !showLongLat"
          >
            {{ showLongLat ? '隱藏經緯度' : '顯示經緯度' }}
          </button>
          <SwitchMapModeButton />
          <div class="hidden flex-1 justify-center md:flex">
            <AppButton class="max-w-[345px]" color="dark-green" @click="chooseLocation">選擇此地點</AppButton>
          </div>
        </div>
        <p v-if="showLongLat" class="mt-1 text-xs text-brand-gray">
          經度：{{ appStore.mapLngLat[0]?.toFixed(7) }} / 緯度：{{ appStore.mapLngLat[1]?.toFixed(7) }}
        </p>
      </div>
    </template>

    <ImageUploadForm
      v-if="appStore.createStepIndex === 2"
      v-model="selectedImages"
      class="pointer-events-auto"
      :uploading="imageUploadState.uploading"
      :error="imageUploadState.error"
      :preview-images="uploadedImages"
      :on-click-remove-image="onClickRemoveImage"
      :valid="imageUploadFormValid"
      :submit="appStore.gotoNextCreate"
      :form-state="formState"
      @update:form-state="Object.assign(formState, $event)"
    />

    <ConfirmFactory
      v-if="appStore.createStepIndex === 3"
      class="pointer-events-auto"
      :form-state="formState"
      :preview-images="uploadedImages"
      :submit="submitFactory"
      @update:form-state="Object.assign(formState, $event)"
    />

    <AppModal :open="discardDialog" :dismiss="() => (discardDialog = false)" class="max-w-[290px]">
      <h3 class="mb-2 text-lg font-medium text-brand-dark">放棄新增可疑工廠嗎？</h3>
      <p class="mb-4 text-sm">放棄新增可疑工廠時，你將遺失所有已輸入的資料。下次需重新填寫。</p>
      <AppButton @click="discardDialog = false">繼續填寫資料</AppButton>
      <button type="button" class="mt-4 block w-full text-center underline" @click="cancelCreateFactory">放棄新增</button>
    </AppModal>
  </div>
</template>
