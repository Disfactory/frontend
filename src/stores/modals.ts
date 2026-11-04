import { ref } from 'vue'
import { defineStore } from 'pinia'
import { isNotSupportedIOS } from '@/lib/browserCheck'
import { useGA } from '@/lib/useGA'

type TimedModal =
  | 'updateFactorySuccessModal'
  | 'updateFactoryImageSuccessModal'
  | 'createFactorySuccessModal'

export const useModalStore = defineStore('modals', () => {
  const { event } = useGA()

  const updateFactorySuccessModal = ref(false)
  const updateFactoryImageSuccessModal = ref(false)
  const createFactorySuccessModal = ref(false)
  const aboutModalOpen = ref(false)
  const contactModalOpen = ref(false)
  const safetyModalOpen = ref(false)
  const hasStorage = typeof localStorage !== 'undefined'
  const gettingStartedModalOpen = ref(hasStorage ? localStorage.getItem('use-app') !== 'true' : true)
  const tutorialModalOpen = ref(false)
  const supportIOSVersionModalOpen = ref(isNotSupportedIOS())
  const apiConfigModalOpen = ref(false)
  const sidebarOpen = ref(false)
  const filterModalOpen = ref(false)

  const timers: Partial<Record<TimedModal, number>> = {}

  function openTimed(key: TimedModal) {
    if (timers[key]) window.clearTimeout(timers[key])
    const flag = {
      updateFactorySuccessModal,
      updateFactoryImageSuccessModal,
      createFactorySuccessModal,
    }[key]
    flag.value = true
    timers[key] = window.setTimeout(() => {
      flag.value = false
      timers[key] = undefined
    }, 3000)
  }

  const openUpdateFactorySuccessModal = () => openTimed('updateFactorySuccessModal')
  const openUpdateFactoryImagesSuccessModal = () => openTimed('updateFactoryImageSuccessModal')
  const openCreateFactorySuccessModal = () => openTimed('createFactorySuccessModal')
  const closeCreateFactorySuccessModal = () => {
    createFactorySuccessModal.value = false
  }
  const openAboutModal = () => {
    aboutModalOpen.value = true
  }
  const closeAboutModal = () => {
    aboutModalOpen.value = false
  }
  const openContactModal = () => {
    contactModalOpen.value = true
  }
  const closeContactModal = () => {
    contactModalOpen.value = false
  }
  const openSafetyModal = () => {
    safetyModalOpen.value = true
  }
  const closeSafetyModal = () => {
    safetyModalOpen.value = false
  }
  const openGettingStartedModal = () => {
    gettingStartedModalOpen.value = true
  }
  const closeGettingStartedModal = () => {
    gettingStartedModalOpen.value = false
  }
  const openTutorialModal = () => {
    tutorialModalOpen.value = true
  }
  const closeTutorialModal = () => {
    tutorialModalOpen.value = false
  }
  const openApiConfigModal = () => {
    apiConfigModalOpen.value = true
  }
  const closeApiConfigModal = () => {
    apiConfigModalOpen.value = false
  }
  const closesupportIOSVersionModal = () => {
    supportIOSVersionModalOpen.value = false
  }
  const toggleSidebar = () => {
    const open = !sidebarOpen.value
    event('toggleSidebar', { target: open })
    sidebarOpen.value = open
  }
  const closeSidebar = () => {
    sidebarOpen.value = false
  }
  const closeFilterModal = () => {
    event('closeFilterModal')
    filterModalOpen.value = false
  }
  const openFilterModal = () => {
    event('openFilterModal')
    filterModalOpen.value = true
  }

  return {
    updateFactorySuccessModal,
    updateFactoryImageSuccessModal,
    createFactorySuccessModal,
    aboutModalOpen,
    contactModalOpen,
    safetyModalOpen,
    gettingStartedModalOpen,
    tutorialModalOpen,
    supportIOSVersionModalOpen,
    apiConfigModalOpen,
    sidebarOpen,
    filterModalOpen,
    openUpdateFactorySuccessModal,
    openUpdateFactoryImagesSuccessModal,
    openCreateFactorySuccessModal,
    closeCreateFactorySuccessModal,
    openAboutModal,
    closeAboutModal,
    openContactModal,
    closeContactModal,
    openSafetyModal,
    closeSafetyModal,
    openGettingStartedModal,
    closeGettingStartedModal,
    openTutorialModal,
    closeTutorialModal,
    openApiConfigModal,
    closeApiConfigModal,
    closesupportIOSVersionModal,
    toggleSidebar,
    closeSidebar,
    closeFilterModal,
    openFilterModal,
  }
})
