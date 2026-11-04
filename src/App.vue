<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AppAlert from '@/components/AppAlert.vue'
import MapView from '@/components/MapView.vue'
import FactoryDetailPage from '@/components/FactoryDetailPage.vue'
import CreateFactorySteps from '@/components/CreateFactorySteps.vue'
import UpdateFactorySteps from '@/components/UpdateFactorySteps.vue'
import AboutModal from '@/components/AboutModal.vue'
import ContactModal from '@/components/ContactModal.vue'
import GettingStartedModal from '@/components/GettingStartedModal.vue'
import SafetyModal from '@/components/SafetyModal.vue'
import TutorialModal from '@/components/TutorialModal.vue'
import IOSVersionAlertModal from '@/components/IOSVersionAlertModal.vue'
import ApiConfigModal from '@/components/ApiConfigModal.vue'
import SuccessModal from '@/components/SuccessModal.vue'
import { useAppStore } from '@/stores/app'
import { useAlertStore } from '@/stores/alerts'
import { useModalStore } from '@/stores/modals'

const appStore = useAppStore()
const modalStore = useModalStore()
const alertStore = useAlertStore()

const isDesktop = useMediaQuery('(min-width: 960px)')
const showHeader = computed(
  () => appStore.isInitialState || (appStore.isEditFactoryMode && isDesktop.value),
)
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <AppHeader v-if="showHeader" @open-menu="modalStore.toggleSidebar()" />

    <main class="relative min-h-0 flex-1">
      <MapView />
      <CreateFactorySteps v-if="appStore.isCreateMode" />
      <UpdateFactorySteps v-if="appStore.isEditMode" />
      <FactoryDetailPage />
    </main>

    <AppAlert :alert="alertStore.alert" :dismiss="alertStore.dismissAlert" />
    <AppSidebar :open="modalStore.sidebarOpen" @close="modalStore.closeSidebar()" />

    <AboutModal :open="modalStore.aboutModalOpen" :dismiss="modalStore.closeAboutModal" />
    <ContactModal :open="modalStore.contactModalOpen" :dismiss="modalStore.closeContactModal" />
    <GettingStartedModal
      :open="modalStore.gettingStartedModalOpen"
      :dismiss="modalStore.closeGettingStartedModal"
    />
    <SafetyModal :open="modalStore.safetyModalOpen" :dismiss="modalStore.closeSafetyModal" />
    <TutorialModal :open="modalStore.tutorialModalOpen" :dismiss="modalStore.closeTutorialModal" />
    <IOSVersionAlertModal
      :open="modalStore.supportIOSVersionModalOpen"
      :dismiss="modalStore.closesupportIOSVersionModal"
    />
    <ApiConfigModal :open="modalStore.apiConfigModalOpen" :dismiss="modalStore.closeApiConfigModal" />

    <SuccessModal :open="modalStore.createFactorySuccessModal" title="新增可疑工廠成功" />
    <SuccessModal :open="modalStore.updateFactoryImageSuccessModal" title="補充工廠照片成功" />
    <SuccessModal :open="modalStore.updateFactorySuccessModal" title="補充工廠資訊成功" />
  </div>
</template>
