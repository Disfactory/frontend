<template>
  <div class='update-factory-steps'>
    <v-app-bar fixed color="white" class="d-block d-md-none">
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
    />
  </div>
</template>

<script lang="ts">
import { useImageUpload } from '@/lib/imageUpload'
import { createComponent, reactive, ref } from '@vue/composition-api'
import { useAppState } from '../lib/appState'
import ImageUploadForm from './ImageUploadForm.vue'

export default createComponent({
  name: 'UpdateFactorySteps',
  components: {
    ImageUploadForm
  },
  setup () {
    const [appState, { pageTransition }] = useAppState()

    const {
      selectedImages,
      imageUploadState,
      uploadedImages,
      onClickRemoveImage,
      imageUploadFormValid
    } = useImageUpload()

    const imageUploadFormState = reactive({
      nickname: '',
      contact: ''
    })

    const submitImageUpload = () => {
      // TODO:
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
