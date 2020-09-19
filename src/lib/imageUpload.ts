import { UploadedImage, uploadImages } from '@/api'
import { computed, reactive, ref, watch } from '@vue/composition-api'

export const useImageUpload = () => {
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

  return {
    selectedImages,
    imageUploadState,
    uploadedImages,
    onClickRemoveImage,
    imageUploadFormValid
  }
}
