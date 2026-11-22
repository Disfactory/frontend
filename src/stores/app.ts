import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { featureStyleCache } from '@/lib/map'
import { useGA } from '@/lib/useGA'
import type { FactoryData } from '@/types'

export enum PageState {
  INITIAL = 'INITIAL',
  CREATE_FACTORY_1 = 'CREATE_FACTORY_1',
  CREATE_FACTORY_2 = 'CREATE_FACTORY_2',
  CREATE_FACTORY_3 = 'CREATE_FACTORY_3',
  UPDATE_FACTORY_IMAGES = 'UPDATE_FACTORY_IMAGES',
  UPDATE_FACTORY_MODE = 'UPDATE_FACTORY_MODE',
}

const createFactoryPageStates = [
  PageState.CREATE_FACTORY_1,
  PageState.CREATE_FACTORY_2,
  PageState.CREATE_FACTORY_3,
]
const updateFactoryPageStates = [PageState.UPDATE_FACTORY_IMAGES, PageState.UPDATE_FACTORY_MODE]

export const useAppStore = defineStore('app', () => {
  const { event, pageview } = useGA()

  const pageState = ref<PageState>(PageState.INITIAL)
  const factoryData = ref<FactoryData | null>(null)
  const factoryLocation = ref<number[]>([])
  const updateFactoryField = ref<'others' | 'name' | 'factory_type'>('others')
  const mapLngLat = ref<number[]>([])
  const canPlaceFactory = ref(false)
  const factoryDetailsExpanded = ref(false)

  const isCreateMode = computed(() => createFactoryPageStates.includes(pageState.value))
  const createStepIndex = computed(() => createFactoryPageStates.indexOf(pageState.value) + 1)
  const isEditImagesMode = computed(() => pageState.value === PageState.UPDATE_FACTORY_IMAGES)
  const isEditFactoryMode = computed(() => pageState.value === PageState.UPDATE_FACTORY_MODE)
  const isEditMode = computed(() => updateFactoryPageStates.includes(pageState.value))
  const isInitialState = computed(() => pageState.value === PageState.INITIAL)
  const isInitialPage = computed(() => pageState.value === PageState.INITIAL)
  const selectFactoryMode = computed(() => pageState.value === PageState.CREATE_FACTORY_1)
  const formPageOpen = computed(
    () =>
      createFactoryPageStates.includes(pageState.value) ||
      pageState.value === PageState.UPDATE_FACTORY_IMAGES,
  )
  const isEditComment = computed(
    () => isEditFactoryMode.value && updateFactoryField.value === 'others',
  )
  const isEditName = computed(() => isEditFactoryMode.value && updateFactoryField.value === 'name')
  const isEditType = computed(
    () => isEditFactoryMode.value && updateFactoryField.value === 'factory_type',
  )

  const invalidTransition = (): never => {
    throw new Error('Invalid page transition')
  }

  function startCreateFactory() {
    if (pageState.value !== PageState.INITIAL) invalidTransition()
    pageState.value = PageState.CREATE_FACTORY_1
    event('enterSelectFactoryMode')
  }

  function gotoNextCreate() {
    const index = createFactoryPageStates.indexOf(pageState.value)
    if (index === -1 || index === createFactoryPageStates.length - 1) invalidTransition()
    pageState.value = createFactoryPageStates[index + 1] as PageState
    if (index === 0) pageview('/create')
  }

  function nextCreateStep() {
    const index = createFactoryPageStates.indexOf(pageState.value)
    const next = createFactoryPageStates[index + 1]
    if (next) pageState.value = next
  }

  function previousCreateStep() {
    const index = createFactoryPageStates.indexOf(pageState.value)
    const previous = createFactoryPageStates[index - 1]
    if (previous) pageState.value = previous
  }

  function cancelCreateFactory() {
    if (!createFactoryPageStates.includes(pageState.value)) invalidTransition()
    pageState.value = PageState.INITIAL
    event('exitSelectFactoryMode')
  }

  function gotoCreateStep(step: number) {
    const target = createFactoryPageStates[step]
    if (!target) return invalidTransition()
    pageState.value = target
  }

  function startUpdateFactoryImages() {
    if (pageState.value !== PageState.INITIAL) invalidTransition()
    pageState.value = PageState.UPDATE_FACTORY_IMAGES
    pageview('/edit')
  }

  function cancelUpdateFactoryImages() {
    if (pageState.value !== PageState.UPDATE_FACTORY_IMAGES) invalidTransition()
    pageState.value = PageState.INITIAL
    event('exitUpdateFactoryImagesMode')
  }

  function startUpdateFactoryComment(field: 'others' | 'name' | 'factory_type' = 'others') {
    if (pageState.value !== PageState.INITIAL) invalidTransition()
    pageState.value = PageState.UPDATE_FACTORY_MODE
    updateFactoryField.value = field
    pageview('/editComment')
  }

  function cancelUpdateFactoryComment() {
    if (pageState.value !== PageState.UPDATE_FACTORY_MODE) invalidTransition()
    pageState.value = PageState.INITIAL
    event('exitUpdateFactoryCommentsMode')
  }

  function closeFactoryPage() {
    if (!createFactoryPageStates.includes(pageState.value) && !updateFactoryPageStates.includes(pageState.value)) {
      invalidTransition()
    }
    pageState.value = PageState.INITIAL
    event('closeFactoryPage')
  }

  function setFactoryData(factory: FactoryData | null) {
    factoryData.value = factory
  }

  function openEditFactoryForm(factory: FactoryData) {
    factoryData.value = factory
    startUpdateFactoryImages()
  }

  function setFactoryLocation(value: [number, number]) {
    factoryLocation.value = value
    event('setFactoryLocation')
  }

  function expandFactoryDetail() {
    factoryDetailsExpanded.value = true
  }

  function collapseFactoryDetail() {
    const defaultStyle = featureStyleCache.get(factoryData.value?.id as string)
    if (defaultStyle) {
      ;(factoryData.value?.feature as { setStyle?: (style: unknown) => void } | undefined)?.setStyle?.(
        defaultStyle,
      )
    }
    factoryDetailsExpanded.value = false
    factoryData.value = null
  }

  function toggleFactoryDetail() {
    factoryDetailsExpanded.value = !factoryDetailsExpanded.value
  }

  return {
    pageState,
    factoryData,
    factoryLocation,
    updateFactoryField,
    mapLngLat,
    canPlaceFactory,
    factoryDetailsExpanded,
    isCreateMode,
    createStepIndex,
    isEditImagesMode,
    isEditFactoryMode,
    isEditMode,
    isInitialState,
    isInitialPage,
    selectFactoryMode,
    formPageOpen,
    isEditComment,
    isEditName,
    isEditType,
    startCreateFactory,
    gotoNextCreate,
    nextCreateStep,
    previousCreateStep,
    cancelCreateFactory,
    gotoCreateStep,
    startUpdateFactoryImages,
    cancelUpdateFactoryImages,
    startUpdateFactoryComment,
    cancelUpdateFactoryComment,
    closeFactoryPage,
    setFactoryData,
    openEditFactoryForm,
    setFactoryLocation,
    expandFactoryDetail,
    collapseFactoryDetail,
    toggleFactoryDetail,
  }
})
