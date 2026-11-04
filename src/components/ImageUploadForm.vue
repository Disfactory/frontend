<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCircle2, X } from '@lucide/vue'
import AppButton from './AppButton.vue'
import AppTextField from './AppTextField.vue'
import type { UploadedImage } from '@/api'

const props = withDefaults(
  defineProps<{
    modelValue?: FileList | null
    previewImages?: UploadedImage[]
    uploading?: boolean
    error?: boolean | null
    onClickRemoveImage?: (image: UploadedImage) => void
    submit?: () => void
    valid?: boolean
    formState?: { nickname?: string; contact?: string }
    submitText?: string
    disableProgressiveUpload?: boolean
  }>(),
  {
    modelValue: null,
    previewImages: () => [],
    uploading: false,
    error: null,
    onClickRemoveImage: undefined,
    submit: undefined,
    valid: false,
    formState: () => ({ nickname: '', contact: '' }),
    submitText: '',
    disableProgressiveUpload: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [FileList | null]
  'update:formState': [{ nickname: string; contact: string }]
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const onChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).files)
}

const nickname = computed({
  get: () => props.formState?.nickname ?? '',
  set: (value: string) =>
    emit('update:formState', { ...props.formState, nickname: value, contact: props.formState?.contact ?? '' }),
})
const contact = computed({
  get: () => props.formState?.contact ?? '',
  set: (value: string) =>
    emit('update:formState', { ...props.formState, nickname: props.formState?.nickname ?? '', contact: value }),
})

const onSubmit = () => {
  if (props.valid) props.submit?.()
}
</script>

<template>
  <div
    data-testid="image-upload-form"
    class="absolute inset-x-0 top-14 bottom-0 z-10 overflow-y-auto bg-white"
  >
    <div class="mx-auto w-full max-w-[630px] px-4 pt-4 pb-24 md:pt-12">
      <h2 class="mb-4 text-xl font-medium text-brand-dark">上傳工廠照片</h2>
      <p class="mb-6 text-brand-dark">請至少上傳一張工廠照片。</p>

      <h3 class="required mb-3 text-lg font-medium text-brand">工廠照片</h3>
      <div class="mb-3 flex items-center gap-3">
        <button
          type="button"
          class="rounded border border-brand px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand hover:text-white disabled:opacity-50"
          :disabled="uploading"
          @click="fileInput?.click()"
        >
          新增照片
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          :disabled="uploading"
          @change="onChange"
        />
        <span v-if="uploading && !disableProgressiveUpload" class="text-sm text-brand-gray">上傳中...</span>
        <span
          v-if="valid && !uploading && !error && !disableProgressiveUpload"
          class="flex items-center gap-1 text-sm text-brand"
        >
          上傳成功 <CheckCircle2 class="size-4" />
        </span>
        <span v-if="error && !disableProgressiveUpload" class="text-sm text-brand-red">上傳錯誤</span>
      </div>

      <div class="mb-4 grid grid-cols-2 gap-3">
        <div
          v-for="image in previewImages"
          :key="image.token"
          class="relative aspect-[2/1] overflow-hidden rounded border"
        >
          <img :src="image.src" class="h-full w-full object-cover" alt="" />
          <button
            type="button"
            class="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
            aria-label="移除照片"
            @click="onClickRemoveImage?.(image)"
          >
            <X class="size-4" />
          </button>
        </div>
      </div>

      <hr class="my-6 border-brand-line" />

      <h2 class="mb-2 text-xl font-medium text-brand-dark">聯絡資訊（非必填）</h2>
      <p class="mb-6 text-brand-dark">
        如果對於照片有疑問，<br />我們會透過以下提供的資訊聯絡你。<br />如不願揭露自己身份，可跳過不填。
      </p>

      <h3 class="mb-2 text-lg font-medium text-brand">聯絡人暱稱</h3>
      <AppTextField v-model="nickname" placeholder="例：林先生、林小姐" />

      <h3 class="mt-7 mb-2 text-lg font-medium text-brand">聯絡方式（email 或電話）</h3>
      <AppTextField v-model="contact" placeholder="例：abc@email.com、0920-123456" />

      <div class="fixed inset-x-0 bottom-0 flex justify-center bg-white px-4 py-3">
        <AppButton class="max-w-[345px]" :disabled="!valid" @click="onSubmit">
          {{ submitText || '下一步' }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
