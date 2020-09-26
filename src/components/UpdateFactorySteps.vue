<template>
  <div class='update-factory-steps'>
    <!-- AppBar for Mobile -->
    <v-app-bar fixed color="white" class="d-block d-md-none">
      <v-spacer></v-spacer>
      <v-toolbar-title v-if="appState.isEditImagesMode">補充照片</v-toolbar-title>
      <v-toolbar-title v-else>補充工廠描述</v-toolbar-title>
      <v-spacer></v-spacer>

      <div class="btn-container">
        <v-dialog v-model="discardDialog" max-width="290">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-on="on" v-bind="attrs">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
          <v-card v-if="appState.isEditImagesMode">
            <v-card-title class="headline">補充照片尚未完成</v-card-title>
            <v-card-text>放棄補充照片的話，你將遺失所有未新增的資料。下次需重新上傳照片</v-card-text>
            <v-container class="text-center">
              <v-btn width="100%" x-large rounded color="green darken-1" @click="discardDialog = false">繼續編輯</v-btn>
              <a class="d-block mt-4" @click="cancelUpdateFactoryImages">確定放棄</a>
            </v-container>
          </v-card>
          <v-card v-else>
            <v-card-title class="secondary--text">補充工廠描述尚未完成！</v-card-title>
            <v-card-text>放棄補充工廠描述的話，你將遺失所有未新增的資料。下次需重新填寫。</v-card-text>
            <v-container class="text-center">
              <v-btn width="100%" x-large rounded color="primary" @click="discardDialog = false">繼續編輯</v-btn>
              <a class="d-block mt-4" @click="cancelUpdateFactoryComments">確定放棄</a>
            </v-container>
          </v-card>
        </v-dialog>
      </div>
    </v-app-bar>

    <!-- AppBar for Desktop -->
    <v-app-bar fixed color="white" class="d-none d-md-block" v-if="appState.isEditImagesMode">
      <v-toolbar-title>補充照片</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-dialog v-model="discardDialog" max-width="290">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-on="on" v-bind="attrs" outlined>
            取消
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="secondary--text">補充照片尚未完成</v-card-title>
          <v-card-text>放棄補充照片的話，你將遺失所有未新增的資料。下次需重新上傳照片</v-card-text>
          <v-container class="text-center">
            <v-btn width="100%" x-large rounded color="primary" @click="discardDialog = false">繼續編輯</v-btn>
            <a class="d-block mt-4" @click="cancelUpdateFactoryImages">確定放棄</a>
          </v-container>
        </v-card>
      </v-dialog>
    </v-app-bar>

    <image-upload-form
      v-if="appState.isEditImagesMode"
      v-model="selectedImages"
      :uploading="imageUploadState.uploading"
      :error="imageUploadState.error"
      :previewImages="uploadedImages"
      :onClickRemoveImage="onClickRemoveImage"
      :valid="imagesValid"
      :submit="submitImageUpload"
      :formState="imageUploadFormState"
      submitText="確認新增照片"
      disableProgressiveUpload
    />

    <div class="update-factory-comment-container w-100 px-4 py-4 d-flex flex-column justify-between" v-else-if="$vuetify.breakpoint.smAndDown">
      <div>
        <h3 class="mb-1">工廠描述</h3>
        <v-textarea outlined solo v-model="others" placeholder="例：常常散發異味" />
      </div>
      <v-btn x-large rounded class="w-100" :disabled="!commentsValid" style="width: 100%; max-width: 345px; margin: 0 auto;" @click="submitUpdateComments">
        新增工廠描述
      </v-btn>
    </div>

    <v-dialog v-model="appState.isEditCommentMode" persistent max-width="395" v-if="$vuetify.breakpoint.mdAndUp">
      <div class="update-factory-comment-modal w-100 px-4 py-4 d-flex flex-column justify-between">
        <div class="d-flex justify-end">
          <v-btn icon @click="cancelUpdateFactoryComments">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div>
          <h3 class="mb-3">工廠描述</h3>
          <v-textarea outlined solo v-model="others" placeholder="例：常常散發異味" />
        </div>
        <v-btn x-large rounded class="w-100" :disabled="!commentsValid" style="width: 100%; max-width: 345px; margin: 0 auto;" @click="submitUpdateComments" color="primary">
          新增工廠描述
        </v-btn>
      </div>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { useUpdateFactoryImage } from '@/lib/imageUpload'
import { updateFactoryImages, updateFactory } from '@/api'
import { computed, createComponent, inject, reactive, ref } from '@vue/composition-api'
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

    const imageSubmitting = ref(false)
    const imagesValid = computed(() => imageUploadFormValid.value && !imageSubmitting.value)
    const submitImageUpload = async () => {
      if (!appState.factoryData?.id || !selectedImages.value) {
        return
      }

      imageSubmitting.value = true

      try {
        const newImages = await updateFactoryImages(
          appState.factoryData?.id,
          selectedImages.value, {
            nickname: imageUploadFormState.nickname,
            contact: imageUploadFormState.contact
          }
        )

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

      imageSubmitting.value = false
    }

    const discardDialog = ref(false)

    const cancelUpdateFactoryImages = () => {
      discardDialog.value = false
      pageTransition.cancelUpdateFactoryImages()
    }

    const cancelUpdateFactoryComments = () => {
      discardDialog.value = false
      pageTransition.cancelUpdateFactoryComment()
    }

    const others = ref('')
    const submitting = ref(false)
    const commentsValid = computed(() => others.value.length > 0 && !submitting.value)

    const submitUpdateComments = async () => {
      if (!appState.factoryData?.id || !others.value) {
        return
      }

      submitting.value = true

      try {
        await updateFactory(appState.factoryData?.id, {
          others: others.value
        })

        // TOOD: comments not displayed or stored in factory data for now

        pageTransition.cancelUpdateFactoryComment()
        modalActions.openUpdateFactorySuccessModal()
      } catch (err) {}

      submitting.value = false
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
      imagesValid,
      submitImageUpload,
      cancelUpdateFactoryImages,
      cancelUpdateFactoryComments,
      others,
      commentsValid,
      submitUpdateComments
    }
  }
})
</script>

<style lang="scss" scoped>
.btn-container {
  position: absolute;
  right: 5px;
}

.update-factory-steps {
  z-index: 6;
  position: absolute;
  width: 100%;
  height: 100%;
}

.update-factory-comment-container {
  @import '@/styles/typography.scss';

  background-color: white;
  z-index: 2;
  position: absolute;
  height: 100%;

  padding-bottom: 50px;
  overflow-y: auto;
  overflow-x: hidden;
}

.update-factory-comment-modal {
  @import '@/styles/typography.scss';
  background-color: white;
  z-index: 2;
}
</style>
