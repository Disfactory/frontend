<template>
  <v-dialog v-model="maintenanceModalState" v-bind="$attrs" max-width="600">
    <div class="maintenance-modal">
      <div class="page">
        <h2>🔧【系統維修中！】</h2>
        <div class="icon-section">
          <v-icon color="warning" size="48">mdi-alert</v-icon>
        </div>
        <div class="message-section">
          <p class="main-message">
            目前上傳圖片功能受限，暫時停止回報功能，敬請見諒！
          </p>
          <p class="detail-message">
            各位使用 disfactory.tw 的朋友們好，我們近期接獲多位使用者反映，在檢舉違章工廠時無法成功上傳圖片。<br><br>
            經確認原因為目前使用的圖片託管平台，自 2025 年 5 月中起限制上傳，導致我們的網站無法順利將民眾上傳的照片轉存，因此現在暫時停止回報的功能。<br><br>
            目前我們正在嘗試修復此問題，並會盡快更新系統，恢復回報功能。<br><br>
            感謝大家的理解！
          </p>
        </div>
        <div class="button-section">
          <app-button @click="dismiss" data-testid="close-button">
            關閉
          </app-button>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import AppButton from './AppButton.vue'
import { VIcon } from 'vuetify/lib/components'

export default defineComponent({
  name: 'MaintenanceModal',
  components: { AppButton, VIcon },
  props: {
    value: {
      required: true,
      type: Boolean
    }
  },
  setup (props, context) {
    const maintenanceModalState = computed({
      get: () => props.value,
      set: (value) => context.emit('input', value)
    })

    const dismiss = () => {
      maintenanceModalState.value = false
    }

    return {
      maintenanceModalState,
      dismiss
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables';

.maintenance-modal {
  padding: 27px 22px;
  background-color: white;

  .page {
    h2 {
      line-height: normal;
      margin-bottom: 20px;
    }

    .icon-section {
      text-align: center;
      margin-bottom: 16px;
    }

    .message-section {
      margin-bottom: 20px;
    }
  }
}
</style>
