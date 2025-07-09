<template>
  <div class="maintenance-modal-container">
    <app-modal :open="open" :dismiss="dismiss">
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
    </app-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AppModal from './AppModal.vue'
import AppButton from './AppButton.vue'
import { VIcon } from 'vuetify/lib/components'

export default defineComponent({
  name: 'MaintenanceModal',
  components: { AppModal, AppButton, VIcon },
  props: {
    open: {
      type: Boolean,
      required: true
    },
    dismiss: {
      type: Function,
      required: true
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables';

.maintenance-modal-container :deep(.app-modal) {
  top: 25px;
  max-height: calc(100% - 50px);
  max-width: 600px;
  width: calc(100% - 40px);

  .page {
    h2 {
      color: $primary-color;
      margin-bottom: 20px;
      text-align: center;
    }

    .icon-section {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }

    .message-section {
      margin-bottom: 20px;

      .main-message {
        font-weight: bold;
        color: #222 !important;
        margin-bottom: 16px;
        font-size: 18px;
      }

      .detail-message {
        color: #333 !important;
        font-size: 15px;
        line-height: 1.8;
      }
    }

    .button-section {
      display: flex;
      justify-content: center;
      .app-button {
        min-width: 120px;
      }
    }
  }
}
</style>
