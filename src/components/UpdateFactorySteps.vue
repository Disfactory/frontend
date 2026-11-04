<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { X } from '@lucide/vue'
import AppButton from './AppButton.vue'
import AppModal from './AppModal.vue'
import AppTextArea from './AppTextArea.vue'
import AppTextField from './AppTextField.vue'
import AppSelect from './AppSelect.vue'
import ImageUploadForm from './ImageUploadForm.vue'
import { useAppStore } from '@/stores/app'
import { useModalStore } from '@/stores/modals'
import { useMapStore } from '@/stores/map'
import { useGA } from '@/lib/useGA'
import { useUpdateFactoryImage } from '@/lib/imageUpload'
import { updateFactory, updateFactoryImages } from '@/api'
import { FACTORY_TYPE, type FactoryType } from '@/types'

const appStore = useAppStore()
const modalStore = useModalStore()
const mapStore = useMapStore()
const { event } = useGA()

const discardDialog = ref(false)
const imageSubmitting = ref(false)
const {
  selectedImages,
  imageUploadState,
  uploadedImages,
  onClickRemoveImage,
  imageUploadFormValid,
} = useUpdateFactoryImage()
const imageUploadFormState = reactive({ nickname: '', contact: '' })
const imagesValid = computed(() => imageUploadFormValid.value && !imageSubmitting.value)

const submitImageUpload = async () => {
  const factory = appStore.factoryData
  if (!factory?.id || !selectedImages.value) return

  imageSubmitting.value = true
  try {
    const newImages = await updateFactoryImages(factory.id, selectedImages.value, {
      nickname: imageUploadFormState.nickname,
      contact: imageUploadFormState.contact,
    })
    factory.images = factory.images.concat(newImages)
    mapStore.controller?.updateFactory(factory.id, factory)
    appStore.setFactoryData(factory)
    appStore.cancelUpdateFactoryImages()
    modalStore.openUpdateFactoryImagesSuccessModal()
  } catch (err) {
    console.error(err)
  }
  imageSubmitting.value = false
}

const cancelUpdateFactoryImages = () => {
  discardDialog.value = false
  appStore.cancelUpdateFactoryImages()
}

const formState = reactive({
  others: '',
  name: appStore.factoryData?.name ?? '',
  factory_type: appStore.factoryData?.type as FactoryType | undefined,
  submitting: false,
})
const typeValue = ref(formState.factory_type ?? '')
const setType = (value: string) => {
  typeValue.value = value
  formState.factory_type = (value || undefined) as FactoryType | undefined
}

const validStates = {
  others: computed(() => formState.others.length > 0 && !formState.submitting),
  name: computed(() => (formState.name?.length ?? 0) > 0 && !formState.submitting),
  factory_type: computed(() => !!formState.factory_type && !formState.submitting),
}

const isCurrentFieldValid = computed(() => validStates[appStore.updateFactoryField]?.value ?? false)

const updateFormAppTitle = computed(() =>
  appStore.isEditComment ? '補充工廠描述' : appStore.isEditName ? '更改外部文字' : '更改工廠類型',
)
const updateFormTitle = computed(() =>
  appStore.isEditComment
    ? '工廠描述'
    : appStore.isEditName
      ? '工廠外部文字'
      : appStore.isEditType
        ? '工廠類型'
        : '',
)
const updateFormButton = computed(() =>
  appStore.isEditComment
    ? '新增工廠描述'
    : appStore.isEditName
      ? '確認更改工廠外部文字'
      : '確認更改工廠類型',
)

const submitUpdateFactory = async () => {
  const factory = appStore.factoryData
  if (!factory?.id || !isCurrentFieldValid.value) return

  formState.submitting = true
  try {
    const field = appStore.updateFactoryField
    event('updateFactory', { field })
    const updated = await updateFactory(factory.id, { [field]: formState[field] } as never)
    mapStore.controller?.updateFactory(updated.id, updated)
    appStore.setFactoryData(updated)
    appStore.cancelUpdateFactoryComment()
    modalStore.openUpdateFactorySuccessModal()
  } catch (err) {
    console.error(err)
  }
  formState.submitting = false
}

const cancelUpdateFactory = () => {
  discardDialog.value = false
  appStore.cancelUpdateFactoryComment()
}

const factoryTypeItems: Array<{ text: string; value?: string }> = [...FACTORY_TYPE]
</script>

<template>
  <div class="pointer-events-none absolute inset-0 z-30">
    <header class="pointer-events-auto flex h-14 items-center justify-between border-b bg-white px-3 text-brand-dark">
      <div class="w-10" />
      <h1 class="text-base font-medium">{{ appStore.isEditImagesMode ? '補充照片' : updateFormAppTitle }}</h1>
      <button type="button" class="rounded p-2 hover:bg-black/5" aria-label="關閉" @click="discardDialog = true">
        <X class="size-5" />
      </button>
    </header>

    <ImageUploadForm
      v-if="appStore.isEditImagesMode"
      v-model="selectedImages"
      class="pointer-events-auto"
      :uploading="imageUploadState.uploading"
      :error="imageUploadState.error"
      :preview-images="uploadedImages"
      :on-click-remove-image="onClickRemoveImage"
      :valid="imagesValid"
      :submit="submitImageUpload"
      :form-state="imageUploadFormState"
      :submit-text="imageSubmitting ? '照片上傳中...' : '確認新增照片'"
      disable-progressive-upload
      @update:form-state="Object.assign(imageUploadFormState, $event)"
    />

    <div
      v-else-if="appStore.isEditFactoryMode"
      data-testid="update-factory-panel"
      class="pointer-events-auto absolute top-20 left-1/2 z-40 w-[calc(100%-2rem)] max-w-[395px] -translate-x-1/2 rounded-lg bg-white p-5 shadow-xl"
    >
      <h3 class="mb-3 text-lg font-medium text-brand-dark">{{ updateFormTitle }}</h3>

      <AppTextArea v-if="appStore.isEditComment" v-model="formState.others" placeholder="例：常常散發異味" />
      <AppTextField v-if="appStore.isEditName" v-model="formState.name" placeholder="例：小明化工廠" />
      <AppSelect
        v-if="appStore.isEditType"
        :model-value="typeValue"
        :items="factoryTypeItems"
        placeholder="未選擇"
        @update:model-value="setType"
      />

      <AppButton class="mt-5" :disabled="!isCurrentFieldValid" @click="submitUpdateFactory">
        {{ updateFormButton }}
      </AppButton>
    </div>

    <AppModal :open="discardDialog" :dismiss="() => (discardDialog = false)" :title="appStore.isEditImagesMode ? '放棄補充照片' : '放棄編輯'" class="max-w-[290px]">
      <template v-if="appStore.isEditImagesMode">
        <h3 class="mb-2 text-lg font-medium">補充照片尚未完成</h3>
        <p class="mb-4 text-sm">放棄補充照片的話，你將遺失所有未新增的資料。下次需重新上傳照片。</p>
        <AppButton @click="discardDialog = false">繼續編輯</AppButton>
        <button type="button" class="mt-4 block w-full text-center underline" @click="cancelUpdateFactoryImages">
          確定放棄
        </button>
      </template>
      <template v-else>
        <h3 class="mb-2 text-lg font-medium text-brand-dark">{{ updateFormAppTitle }}尚未完成！</h3>
        <p class="mb-4 text-sm">放棄編輯的話，你將遺失所有未新增的資料。下次需重新填寫。</p>
        <AppButton @click="discardDialog = false">繼續編輯</AppButton>
        <button type="button" class="mt-4 block w-full text-center underline" @click="cancelUpdateFactory">
          確定放棄
        </button>
      </template>
    </AppModal>
  </div>
</template>
