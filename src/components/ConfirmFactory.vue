<script setup lang="ts">
import { computed, ref } from 'vue'
import MinimapView from './MinimapView.vue'
import AppButton from './AppButton.vue'
import AppTextField from './AppTextField.vue'
import AppTextArea from './AppTextArea.vue'
import AppSelect from './AppSelect.vue'
import { FACTORY_TYPE, type FactoryType } from '@/types'
import type { UploadedImage } from '@/api'
import { useAppStore } from '@/stores/app'
import { useMapStore } from '@/stores/map'

const props = defineProps<{
  formState: {
    nickname: string
    contact: string
    others: string
    name: string
    type?: FactoryType
  }
  previewImages: UploadedImage[]
  submit?: () => void
}>()

const emit = defineEmits<{ 'update:formState': [typeof props.formState] }>()

const appStore = useAppStore()
const mapStore = useMapStore()

const initialFactories = ref(mapStore.controller?.factories ?? [])
const initialLocation = ref(mapStore.controller?.mapInstance.map.getView().getCenter() ?? [])

const factoryTypeItems: Array<{ text: string; value?: string }> = [...FACTORY_TYPE]

const gotoStepOne = () => {
  appStore.gotoCreateStep(0)
  mapStore.setLUIVisible(true)
}
const gotoStepTwo = () => {
  appStore.gotoCreateStep(1)
}

const others = computed({
  get: () => props.formState.others,
  set: (value: string) => emit('update:formState', { ...props.formState, others: value }),
})
const name = computed({
  get: () => props.formState.name,
  set: (value: string) => emit('update:formState', { ...props.formState, name: value }),
})
const typeValue = computed({
  get: () => props.formState.type ?? '',
  set: (value: string) =>
    emit('update:formState', { ...props.formState, type: (value || undefined) as FactoryType | undefined }),
})
</script>

<template>
  <div class="absolute inset-0 z-10 overflow-y-auto bg-white">
    <div class="mx-auto w-full max-w-[630px] px-4 pt-4 pb-24 md:pt-12">
      <h2 class="mt-2 mb-2 text-2xl font-medium text-brand-dark">確認及補充工廠資訊</h2>
      <p class="mb-4">請確認工廠地點及照片，並補充工廠資訊。</p>

      <h3 class="required mt-7 mb-2 text-lg font-medium text-brand">工廠地點</h3>
      <p class="mb-3">
        返回<a class="cursor-pointer text-brand-light underline" @click="gotoStepOne">步驟 (1/3)</a>編輯
      </p>

      <div class="flex flex-col gap-4 md:flex-row md:justify-between">
        <div class="relative w-full md:max-w-[430px]">
          <MinimapView
            :initial-factories="initialFactories"
            :initial-location="initialLocation"
            :pin-location="appStore.factoryLocation"
          />
          <button type="button" class="absolute inset-0" aria-label="回到步驟一編輯地點" @click="gotoStepOne" />
        </div>
        <div class="flex justify-between gap-4 md:flex-col md:justify-start md:pl-4">
          <p>
            經度：{{ appStore.factoryLocation[0]?.toFixed(7) }}<br />
            緯度：{{ appStore.factoryLocation[1]?.toFixed(7) }}
          </p>
          <p><small>以上經緯度版本為 WGS84</small></p>
        </div>
      </div>

      <h3 class="required mt-7 mb-2 text-lg font-medium text-brand">工廠照片</h3>
      <p class="mb-3">
        返回<a class="cursor-pointer text-brand-light underline" @click="gotoStepTwo">步驟 (2/3)</a>編輯
      </p>
      <div class="mb-2 grid grid-cols-2 gap-3">
        <div v-for="image in previewImages" :key="image.token" class="relative aspect-[2/1] overflow-hidden rounded border">
          <img :src="image.src" class="h-full w-full object-cover" alt="" />
        </div>
      </div>

      <h3 class="mt-5 mb-2 text-lg font-medium text-brand">聯絡人暱稱</h3>
      <p>{{ formState.nickname || '未填寫' }}</p>

      <h3 class="mt-5 mb-2 text-lg font-medium text-brand">聯絡方式（email 或電話）</h3>
      <p>{{ formState.contact || '未填寫' }}</p>

      <hr class="my-6 border-brand-line" />

      <h2 class="mt-5 mb-5 text-2xl font-medium text-brand-dark">其他工廠資訊（非必填）</h2>
      <p class="mb-4">提供明確的工廠資訊能夠幫助我們更快速的填寫公文。</p>

      <h3 class="mt-5 mb-2 text-lg font-medium text-brand">工廠描述</h3>
      <AppTextArea v-model="others" placeholder="例：常常散發異味" />

      <h3 class="mt-5 mb-2 text-lg font-medium text-brand">工廠外部文字</h3>
      <AppTextField v-model="name" placeholder="例：小明化工廠" />

      <h3 class="mt-5 mb-2 text-lg font-medium text-brand">工廠類型</h3>
      <AppSelect v-model="typeValue" :items="factoryTypeItems" placeholder="未選擇" />

      <div class="fixed inset-x-0 bottom-0 flex justify-center bg-white px-4 py-3">
        <AppButton class="max-w-[345px]" @click="submit">確認送出</AppButton>
      </div>
    </div>
  </div>
</template>
