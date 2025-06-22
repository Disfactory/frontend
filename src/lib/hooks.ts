import { ref, Ref, reactive } from 'vue'
import { useGA } from './useGA'
import { isNotSupportedIOS } from './browserCheck'

export const useModal = (defaultOpen = false): [Ref<boolean>, { open: () => void, dismiss: () => void }] => {
  const state = ref(defaultOpen)

  const open = () => {
    state.value = true
  }

  const dismiss = () => {
    state.value = false
  }

  return [
    state,
    {
      open,
      dismiss
    }
  ]
}

// Global modal state - simple reactive object without provide/inject
const modalState = reactive({
  updateFactorySuccessModal: false,
  updateFactoryImageSuccessModal: false,
  createFactorySuccessModal: false,
  aboutModalOpen: false,
  contactModalOpen: false,
  safetyModalOpen: false,
  gettingStartedModalOpen: localStorage.getItem('use-app') !== 'true',
  tutorialModalOpen: false,
  supportIOSVersionModalOpen: isNotSupportedIOS(),
  apiConfigModalOpen: false,

  sidebarOpen: false,
  filterModalOpen: false
})

export const useModalState = () => {
  const { event } = useGA()

  const openUpdateFactoryImagesSuccessModal = () => {
    modalState.updateFactoryImageSuccessModal = true

    window.setTimeout(() => {
      modalState.updateFactoryImageSuccessModal = false
    }, 3000)
  }

  const openUpdateFactorySuccessModal = () => {
    modalState.updateFactorySuccessModal = true

    window.setTimeout(() => {
      modalState.updateFactorySuccessModal = false
    }, 3000)
  }

  const openCreateFactorySuccessModal = () => {
    modalState.createFactorySuccessModal = true
    window.setTimeout(() => {
      modalState.createFactorySuccessModal = false
    }, 3000)
  }
  const closeCreateFactorySuccessModal = () => { modalState.createFactorySuccessModal = false }

  const openAboutModal = () => { modalState.aboutModalOpen = true }
  const closeAboutModal = () => { modalState.aboutModalOpen = false }

  const openContactModal = () => { modalState.contactModalOpen = true }
  const closeContactModal = () => { modalState.contactModalOpen = false }

  const openSafetyModal = () => { modalState.safetyModalOpen = true }
  const closeSafetyModal = () => { modalState.safetyModalOpen = false }

  const openGettingStartedModal = () => { modalState.gettingStartedModalOpen = true }
  const closeGettingStartedModal = () => { modalState.gettingStartedModalOpen = false }

  const openTutorialModal = () => { modalState.tutorialModalOpen = true }
  const closeTutorialModal = () => { modalState.tutorialModalOpen = false }

  const openApiConfigModal = () => { modalState.apiConfigModalOpen = true }
  const closeApiConfigModal = () => { modalState.apiConfigModalOpen = false }

  const closesupportIOSVersionModal = () => { modalState.supportIOSVersionModalOpen = false }

  const toggleSidebar = () => {
    const open = !modalState.sidebarOpen
    event('toggleSidebar', { target: open })
    modalState.sidebarOpen = open
  }

  const closeFilterModal = () => {
    event('closeFilterModal')
    modalState.filterModalOpen = false
  }
  const openFilterModal = () => {
    event('openFilterModal')
    modalState.filterModalOpen = true
  }

  const modalActions = {
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

    toggleSidebar,
    openFilterModal,
    closeFilterModal,

    closesupportIOSVersionModal
  }

  return [modalState, modalActions] as const
}
