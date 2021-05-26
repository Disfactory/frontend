<template>
  <v-bottom-sheet v-model="isOpen">
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
        >隱藏</v-btn>
        <v-btn
          text
          x-small
          class="primary--text"
          :class="isLUIMapVisable ? 'font-weight-bold' : 'font-weight-light'"
          @click="isLUIMapVisable = true"
        >顯示</v-btn>
      </v-list-item>
      <v-list-item>
        <switch-map-mode-button :isInSheet="true" />
      </v-list-item>
    </v-list>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { createComponent, ref, inject, computed } from '@vue/composition-api'
import { MainMapControllerSymbol } from '@/symbols'
import { MapFactoryController } from '@/lib/map'

import SwitchMapModeButton from '@/components/SwitchMapModeButton.vue'

export default createComponent({
  name: 'DisplaySettingBottomSheet',
  components: {
    SwitchMapModeButton
  },
  setup () {
    const isOpen = ref(false)
    const mapController = inject(MainMapControllerSymbol, ref<MapFactoryController>())

    const isLUIMapVisable$ = ref(false)
    const isLUIMapVisable = computed({
      get: () => {
        isLUIMapVisable$.value = !!mapController.value?.mapInstance.getLUILayerVisible()

        return isLUIMapVisable$.value
      },
      set: (value) => {
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
