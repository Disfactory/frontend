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

export const useUpdateFactoryImage = () => {
  const uploadedImages = ref<UploadedImage[]>([])
  const imageUploadState = {
    error: null,
    uploading: false
  }

  const selectedImages = ref<FileList>(null)
  watch(selectedImages, () => {
    if (!selectedImages.value) {
      return
    }

    const images = Array.from(selectedImages.value).map(f => URL.createObjectURL(f)).map(v => ({
      src: v,
      token: v
    }))

    uploadedImages.value = [
      ...uploadedImages.value,
      ...images
    ]
  })

  const onClickRemoveImage = ({ src }: UploadedImage) => {
    uploadedImages.value = uploadedImages.value.filter(image => image.src !== src)
  }

  const imageUploadFormValid = computed(() => uploadedImages.value.length > 0)

  return {
    selectedImages,
    imageUploadState,
    uploadedImages,
    onClickRemoveImage,
    imageUploadFormValid
  }
}
