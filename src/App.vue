<template>
  <v-app>
    <v-app-bar app color="#6E8501" dark clipped-right>
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
        <v-btn text href="https://about.disfactory.tw/#section-f_c360c8de-447e-4c0a-a856-4af18b9a5240">
          常見問題
        </v-btn>
        <v-btn text href="https://about.disfactory.tw" target="_blank">
          關於舉報系統
        </v-btn>
        <v-btn text href="https://airtable.com/shrUraKakZRpH52DO" target="_blank">
          問題回報
        </v-btn>
      </div>
      <v-app-bar-nav-icon class="d-flex d-sm-none" @click="drawer = !drawer" />
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" app right hide-overlay stateless clipped>
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
            <v-list-item-title>常見問題</v-list-item-title>
          </v-list-item>

          <v-list-item href="https://about.disfactory.tw" target="_blank">
            <v-list-item-title>關於舉報系統</v-list-item-title>
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
      <filter-modal :open="modalState.filterModalOpen" :dismiss="modalActions.closeFilterModal" />

      <v-dialog v-model="modalState.createFactorySuccessModal">
        <v-card>
          <v-card-title class="headline">
            新增可疑工廠成功
          </v-card-title>
          <v-card-text>
            <small>
              3 秒後自動關閉提示訊息
            </small>
          </v-card-text>
        </v-card>
      </v-dialog>

      <update-factory-success-modal
        :open="modalState.updateFactorySuccessModal"
        :dismiss="modalActions.closeUpdateFactorySuccessModal"
      />
      <about-modal :open="modalState.aboutModalOpen" :dismiss="modalActions.closeAboutModal" />
      <contact-modal :open="modalState.contactModalOpen" :dismiss="modalActions.closeContactModal" />
      <getting-started-modal :open="modalState.gettingStartedModalOpen" :dismiss="modalActions.closeGettingStartedModal" />
      <safety-modal :open="modalState.safetyModalOpen" :dismiss="modalActions.closeSafetyModal" />
      <tutorial-modal :open="modalState.tutorialModalOpen" :dismiss="modalActions.closeTutorialModal" />
      <ios-version-modal :open="modalState.supportIOSVersionModalOpen" :dismiss="modalActions.closesupportIOSVersionModal" />
      <!-- alert or modal -->
      <Map
        :setFactoryLocation="appActions.setFactoryLocation"
        :openFilterModal="modalActions.openFilterModal"
      />

      <create-factory-steps v-if="appState.isCreateMode" />
    </v-main>

    <factory-detail />
  </v-app>
</template>

<script lang="ts">
import { createComponent, ref, provide } from '@vue/composition-api'

import Map from '@/components/Map.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppButton from '@/components/AppButton.vue'
import AppSidebar from './components/AppSidebar.vue'
import AppAlert from '@/components/AppAlert.vue'
import FormPage from '@/components/FormPage.vue'
import CreateFactorySteps from '@/components/CreateFactorySteps.vue'
import FactoryDetail from '@/components/FactoryDetail.vue'

import FilterModal from '@/components/FilterModal.vue'
import AboutModal from '@/components/AboutModal.vue'
import ContactModal from '@/components/ContactModal.vue'
import GettingStartedModal from '@/components/GettingStartedModal.vue'
import TutorialModal from '@/components/TutorialModal.vue'
import SafetyModal from '@/components/SafetyModal.vue'
import CreateFactorySuccessModal from '@/components/CreateFactorySuccessModal.vue'
import UpdateFactorySuccessModal from '@/components/UpdateFactorySuccessModal.vue'
import IosVersionModal from '@/components/IOSVersionAlertModal.vue'

import { MapFactoryController } from './lib/map'
import { MainMapControllerSymbol } from './symbols'
import { provideModalState, useModalState } from './lib/hooks'
import { providePopupState } from './lib/factoryPopup'
import { provideGA } from './lib/useGA'
import { provideAppState, useAppState } from './lib/appState'
import { provideAlertState, useAlertState } from './lib/useAlert'

export default createComponent({
  name: 'App',
  components: {
    Map,
    AppAlert,
    AppButton,
    AppNavbar,
    AppSidebar,
    FilterModal,
    AboutModal,
    ContactModal,
    GettingStartedModal,
    SafetyModal,
    CreateFactorySuccessModal,
    UpdateFactorySuccessModal,
    TutorialModal,
    FormPage,
    IosVersionModal,
    CreateFactorySteps,
    FactoryDetail
  },
  setup (_, context) {
    provideGA(context)
    providePopupState()

    provideModalState()
    provideAppState()
    provideAlertState()

    const [modalState, modalActions] = useModalState()
    const [appState, appActions] = useAppState()
    const [alertState, alertActions] = useAlertState()

    // register global accessible map instance
    provide(MainMapControllerSymbol, ref<MapFactoryController>(null))

    const drawer = ref(false)
    return {
      appState,
      alertState,
      alertActions,
      appActions,
      modalState,
      modalActions,
      drawer
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

</style>
