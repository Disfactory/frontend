<template>
  <div class='update-factory-steps'>
    <v-app-bar fixed color="white" class="d-block d-md-none" v-if="appState.isEditImagesMode">
      <v-spacer></v-spacer>
      <v-toolbar-title>補充工廠描述</v-toolbar-title>
      <v-spacer></v-spacer>

      <div class="btn-container">
        <v-dialog v-model="discardDialog" max-width="290">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-on="on" v-bind="attrs">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="headline">補充照片尚未完成</v-card-title>
            <v-card-text>放棄補充照片的話，你將遺失所有未新增的資料。下次需重新上傳照片</v-card-text>
            <v-container class="text-center">
              <v-btn width="100%" x-large rounded color="green darken-1" @click="discardDialog = false">繼續編輯</v-btn>
              <a class="d-block mt-4" @click="cancelUpdateFactoryImages">確定放棄</a>
            </v-container>
          </v-card>
        </v-dialog>
      </div>
    </v-app-bar>

    <image-upload-form
      v-if="appState.isEditImagesMode"
      v-model="selectedImages"
      :uploading="imageUploadState.uploading"
      :error="imageUploadState.error"
      :previewImages="uploadedImages"
      :onClickRemoveImage="onClickRemoveImage"
      :valid="imageUploadFormValid"
      :submit="submitImageUpload"
      :formState="imageUploadFormState"
      submitText="確認新增照片"
      disableProgressiveUpload
    />
  </div>
</template>

<script lang="ts">
import { useUpdateFactoryImage } from '@/lib/imageUpload'
import { updateFactoryImages } from '@/api'
import { createComponent, inject, reactive, ref } from '@vue/composition-api'
import { useAppState } from '../lib/appState'
import { useModalState } from '../lib/hooks'
import ImageUploadForm from './ImageUploadForm.vue'
import { MainMapControllerSymbol } from '@/symbols'
import { MapFactoryController } from '@/lib/map'

export default createComponent({
  name: 'UpdateFactorySteps',
  components: {
    ImageUploadForm
  },
  setup () {
    const [appState, { pageTransition }] = useAppState()
    const [, modalActions] = useModalState()
    const mapController = inject(MainMapControllerSymbol, ref<MapFactoryController>())

    const {
      selectedImages,
      imageUploadState,
      uploadedImages,
      onClickRemoveImage,
      imageUploadFormValid
    } = useUpdateFactoryImage()

    const imageUploadFormState = reactive({
      nickname: '',
      contact: ''
    })

    const submitImageUpload = async () => {
      if (!appState.factoryData?.id || !selectedImages.value) {
        return
      }

      try {
        const newImages = await updateFactoryImages(appState.factoryData?.id, selectedImages.value, {
          nickname: imageUploadFormState.nickname,
          contact: imageUploadFormState.contact
        })

        if (mapController.value) {
          const factory = appState.factoryData
          factory.images = factory.images.concat(newImages)

          mapController.value.updateFactory(factory.id, factory)
          appState.factoryData = factory
        }

        pageTransition.cancelUpdateFactoryImages()
        modalActions.openUpdateFactoryImagesSuccessModal()
      } catch (err) {
        console.error(err)
      }
    }

    const discardDialog = ref(false)

    const cancelUpdateFactoryImages = () => {
      discardDialog.value = false
      pageTransition.cancelUpdateFactoryImages()
    }

    return {
      appState,
      pageTransition,

      discardDialog,
      imageUploadFormState,
      selectedImages,
      imageUploadState,
      uploadedImages,
      onClickRemoveImage,
      imageUploadFormValid,
      submitImageUpload,
      cancelUpdateFactoryImages
    }
  }
})
</script>

<style lang="scss" scoped>
.btn-container {
  position: absolute;
  right: 5px;
}
</style>
