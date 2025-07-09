<template>
  <v-app>
    <v-app-bar app color="primary" dark clipped-right v-show="appState.isInitialState || (appState.isEditFactoryMode && $vuetify.breakpoint.mdAndUp)">
      <v-btn icon class="d-sm-none" style="visibility: hidden;">
        <v-icon>mdi-temp</v-icon>
      </v-btn>
      <v-spacer class="d-sm-none" />
      <v-toolbar-title>農地工廠回報</v-toolbar-title>
      <v-spacer />
      <div class="d-none d-sm-flex">
        <v-btn text @click="modalActions.openTutorialModal">
          使用教學
        </v-btn>
        <v-btn text @click="modalActions.openSafetyModal">
          安全須知
        </v-btn>
        <v-btn text @click="modalActions.openContactModal">
          聯絡我們
        </v-btn>
        <v-btn text href="https://about.disfactory.tw/#question">
          常見問題
        </v-btn>
        <v-btn text href="https://about.disfactory.tw" target="_blank">
          關於回報系統
        </v-btn>
        <v-btn text href="https://airtable.com/shrUraKakZRpH52DO" target="_blank">
          問題回報
        </v-btn>
      </div>
      <v-app-bar-nav-icon class="d-flex d-sm-none" @click="drawer = !drawer" />
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" app right temporary class="app-sidebar">
      <v-list
        nav
        dense
      >
        <v-list-item-group
          active-class="deep-purple--text text--accent-4"
        >
          <v-list-item @click="modalActions.openTutorialModal">
            <v-list-item-title>使用教學</v-list-item-title>
          </v-list-item>

          <v-list-item @click="modalActions.openSafetyModal">
            <v-list-item-title>安全須知</v-list-item-title>
          </v-list-item>

          <v-list-item @click="modalActions.openContactModal">
            <v-list-item-title>聯絡我們</v-list-item-title>
          </v-list-item>

          <v-list-item href="https://about.disfactory.tw/#section-f_c360c8de-447e-4c0a-a856-4af18b9a5240" target="_blank">
            <v-list-item-title></v-list-item-title>
          </v-list-item>

          <v-list-item href="https://about.disfactory.tw" target="_blank">
            <v-list-item-title>關於回報系統</v-list-item-title>
          </v-list-item>

          <v-list-item href="https://airtable.com/shrUraKakZRpH52DO" target="_blank">
            <v-list-item-title>問題回報</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-main style="max-height: 100%; height: 100%;">
      <!-- alert or modal -->
      <app-alert :alert="alertState.alert" :dismiss="alertActions.dismissAlert" />

      <v-dialog v-model="modalState.createFactorySuccessModal" max-width="305">
        <v-card class="text-center pt-5">
          <v-icon color="primary" style="font-size: 80px;">
            mdi-checkbox-marked-circle
          </v-icon>
          <v-card-title class="secondary--text justify-center">
            新增可疑工廠成功
          </v-card-title>
          <v-card-text>
            <small>
              3 秒後自動關閉提示訊息
            </small>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="modalState.updateFactoryImageSuccessModal" max-width="305">
        <v-card class="text-center pt-5">
          <v-icon color="primary" style="font-size: 80px;">
            mdi-checkbox-marked-circle
          </v-icon>
          <v-card-title class="secondary--text justify-center">
            補充工廠照片成功
          </v-card-title>
          <v-card-text>
            <small>
              3 秒後自動關閉提示訊息
            </small>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="modalState.updateFactorySuccessModal" max-width="305">
        <v-card class="text-center pt-5">
          <v-icon color="primary" style="font-size: 80px;">
            mdi-checkbox-marked-circle
          </v-icon>
          <v-card-title class="secondary--text justify-center">
            補充工廠資訊成功
          </v-card-title>
          <v-card-text>
            <small>
              3 秒後自動關閉提示訊息
            </small>
          </v-card-text>
        </v-card>
      </v-dialog>

      <about-modal :open="modalState.aboutModalOpen" :dismiss="modalActions.closeAboutModal" />
      <contact-modal :open="modalState.contactModalOpen" :dismiss="modalActions.closeContactModal" />
      <getting-started-modal :open="modalState.gettingStartedModalOpen" :dismiss="modalActions.closeGettingStartedModal" />
      <safety-modal v-model="modalState.safetyModalOpen" />
      <tutorial-modal :open="modalState.tutorialModalOpen" :dismiss="modalActions.closeTutorialModal" />
      <ios-version-modal :open="modalState.supportIOSVersionModalOpen" :dismiss="modalActions.closesupportIOSVersionModal" />
      <api-config-modal :open="modalState.apiConfigModalOpen" :dismiss="modalActions.closeApiConfigModal" />
      <!-- alert or modal -->
      <MapView
        :setFactoryLocation="appActions.setFactoryLocation"
      />

      <create-factory-steps v-if="appState.isCreateMode" />
      <update-factory-steps v-if="appState.isEditMode" />
    </v-main>

    <factory-detail-page />
    <maintenance-modal :open="maintenanceModalOpen" :dismiss="dismissMaintenanceModal" />
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, provide } from 'vue'

import MapView from '@/components/Map.vue'
import AppAlert from '@/components/AppAlert.vue'
import CreateFactorySteps from '@/components/CreateFactorySteps.vue'
import UpdateFactorySteps from '@/components/UpdateFactorySteps.vue'
import FactoryDetailPage from '@/components/FactoryDetailPage.vue'

import AboutModal from '@/components/AboutModal.vue'
import ContactModal from '@/components/ContactModal.vue'
import GettingStartedModal from '@/components/GettingStartedModal.vue'
import TutorialModal from '@/components/TutorialModal.vue'
import SafetyModal from '@/components/SafetyModal.vue'
import IosVersionModal from '@/components/IOSVersionAlertModal.vue'
import ApiConfigModal from '@/components/ApiConfigModal.vue'

import { MapFactoryController } from './lib/map'
import { MainMapControllerSymbol } from './symbols'
import { useModalState } from './lib/hooks'
import { useAppState } from './lib/appState'
import { useAlertState } from './lib/useAlert'

import MaintenanceModal from './components/MaintenanceModal.vue'

export default defineComponent({
  name: 'App',
  components: {
    MapView,
    AppAlert,
    AboutModal,
    ContactModal,
    GettingStartedModal,
    SafetyModal,
    TutorialModal,
    IosVersionModal,
    ApiConfigModal,
    CreateFactorySteps,
    UpdateFactorySteps,
    FactoryDetailPage,
    MaintenanceModal
  },
  setup () {
    const [modalState, modalActions] = useModalState()
    const [appState, appActions] = useAppState()
    const [alertState, alertActions] = useAlertState()

    // register global accessible map instance
    provide(MainMapControllerSymbol, ref<MapFactoryController | null>(null))

    // Note: API config modal functionality removed for simplification

    const drawer = ref(false)

    // Show maintenance modal on app start, allow closing
    const maintenanceModalOpen = ref(true)
    const dismissMaintenanceModal = () => {
      maintenanceModalOpen.value = false
    }
    return {
      appState,
      alertState,
      alertActions,
      appActions,
      modalState,
      modalActions,
      drawer,
      maintenanceModalOpen,
      dismissMaintenanceModal
    }
  }
})
</script>

<style lang="scss">
@import '~@/styles/index';

@supports (-webkit-touch-callout: none) {
  .v-application {
    height: -webkit-fill-available;
    overflow: hidden;
  }

  .v-application--wrap {
    min-height: unset !important;
    max-height: 100%;
  }
}

.app-sidebar {
  .v-list-item--dense .v-list-item__title, .v-list-item--dense .v-list-item__subtitle, .v-list--dense .v-list-item .v-list-item__title, .v-list--dense .v-list-item .v-list-item__subtitle {
    font-size: 16px;
  }
}

</style>
