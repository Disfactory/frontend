import { computed, reactive, ref, watch } from 'vue'
import { uploadImages, type UploadedImage } from '@/api'

export const useImageUpload = () => {
  const uploadedImages = ref<UploadedImage[]>([])
  const imageUploadState = reactive({
    error: null as boolean | null,
    uploading: false,
  })

  const selectedImages = ref<FileList | null>(null)
  watch(selectedImages, () => {
    imageUploadState.error = null
    if (!selectedImages.value) return

    imageUploadState.uploading = true
    uploadImages(selectedImages.value)
      .then((images) => {
        uploadedImages.value = [...uploadedImages.value, ...images]
      })
      .catch((err) => {
        console.error(err)
        imageUploadState.error = true
      })
      .finally(() => {
        imageUploadState.uploading = false
      })
  })

  const onClickRemoveImage = ({ src }: UploadedImage) => {
    uploadedImages.value = uploadedImages.value.filter((image) => image.src !== src)
  }

  const imageUploadFormValid = computed(
    () => uploadedImages.value.length > 0 && !imageUploadState.uploading,
  )

  return {
    selectedImages,
    imageUploadState,
    uploadedImages,
    onClickRemoveImage,
    imageUploadFormValid,
  }
}

export const useUpdateFactoryImage = () => {
  const uploadedImages = ref<UploadedImage[]>([])
  const imageUploadState = reactive({
    error: null as boolean | null,
    uploading: false,
  })

  const filesBySrc = new Map<string, File>()
  const selectedImages = ref<FileList | null>(null)
  watch(selectedImages, () => {
    if (!selectedImages.value) return
    const files = Array.from(selectedImages.value)
    const images = files.map((file) => {
      const src = URL.createObjectURL(file)
      filesBySrc.set(src, file)
      return { src, token: src }
    })
    uploadedImages.value = [...uploadedImages.value, ...images]
  })

  const onClickRemoveImage = ({ src }: UploadedImage) => {
    filesBySrc.delete(src)
    URL.revokeObjectURL(src)
    uploadedImages.value = uploadedImages.value.filter((image) => image.src !== src)
  }

  const allFiles = computed(() =>
    uploadedImages.value
      .map((image) => filesBySrc.get(image.src))
      .filter((file): file is File => !!file),
  )

  const imageUploadFormValid = computed(() => allFiles.value.length > 0)

  return {
    selectedImages,
    imageUploadState,
    uploadedImages,
    allFiles,
    onClickRemoveImage,
    imageUploadFormValid,
  }
}
