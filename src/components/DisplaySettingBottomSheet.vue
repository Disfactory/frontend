<template>
  <span>
    <v-menu
      v-if="$vuetify.breakpoint.mdAndUp"
      content-class="display-setting-popover"
      v-model="isOpen"
      :close-on-content-click="false"
      :nudge-width="200"
      offset-y
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          class="mx-2 mb-5 white--text"
          v-bind="attrs"
          v-on="on"
        >
          顯示設定
        </v-btn>
      </template>
      <v-card>
        <v-list>
          <v-list-item>
            <h2 class="primary--text text-button">農地範圍 •</h2>
            <v-btn
              text
              x-small
              class="primary--text"
              :class="
                !isLUIMapVisable ? 'font-weight-bold' : 'font-weight-light'
              "
              @click="isLUIMapVisable = false"
              >隱藏</v-btn
            >
            <v-btn
              text
              x-small
              class="primary--text"
              :class="
                isLUIMapVisable ? 'font-weight-bold' : 'font-weight-light'
              "
              @click="isLUIMapVisable = true"
              >顯示</v-btn
            >
          </v-list-item>
          <v-list-item>
            <switch-map-mode-button :isInSheet="true" />
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

    <!-- Mobile -->
    <v-bottom-sheet v-else v-model="isOpen">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          class="mx-2 mb-5 white--text"
          v-bind="attrs"
          v-on="on"
        >
          顯示設定
        </v-btn>
      </template>
      <v-list>
        <v-subheader>地圖顯示設定</v-subheader>
        <v-list-item>
          <h2 class="primary--text text-button">農地範圍 •</h2>
          <v-btn
            text
            x-small
            class="primary--text"
            :class="!isLUIMapVisable ? 'font-weight-bold' : 'font-weight-light'"
            @click="isLUIMapVisable = false"
            >隱藏</v-btn
          >
          <v-btn
            text
            x-small
            class="primary--text"
            :class="isLUIMapVisable ? 'font-weight-bold' : 'font-weight-light'"
            @click="isLUIMapVisable = true"
            >顯示</v-btn
          >
        </v-list-item>
        <v-list-item>
          <switch-map-mode-button :isInSheet="true" />
        </v-list-item>
      </v-list>
    </v-bottom-sheet>
  </span>
</template>

<script lang="ts">
import { defineComponent, ref, inject, computed } from 'vue'
import { MainMapControllerSymbol } from '@/symbols'
import { MapFactoryController } from '@/lib/map'

import SwitchMapModeButton from '@/components/SwitchMapModeButton.vue'

export default defineComponent({
  name: 'DisplaySettingBottomSheet',
  components: {
    SwitchMapModeButton
  },
  setup () {
    const isOpen = ref(false)
    const mapController = inject(
      MainMapControllerSymbol,
      ref<MapFactoryController>()
    )

    const isLUIMapVisable$ = ref(false)
    const isLUIMapVisable = computed({
      get: () => {
        isLUIMapVisable$.value = !!mapController.value?.mapInstance.getLUILayerVisible()

        return isLUIMapVisable$.value
      },
      set: value => {
        mapController.value?.mapInstance.setLUILayerVisible(value)
        isLUIMapVisable$.value = value
      }
    })

    return {
      isOpen,
      isLUIMapVisable
    }
  }
})
</script>

<style lang="scss" scoped>
.display-setting-popover {
  margin-top: 20px;
  contain: initial;
  overflow: visible;
}
.display-setting-popover::before {
  position: absolute;
  content: "";
  top: 0;
  left: 30px;
  transform: translateY(-100%);
  width: 10px;
  height: 13px;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 13px solid #fff;
  z-index: 1;
}
</style>
