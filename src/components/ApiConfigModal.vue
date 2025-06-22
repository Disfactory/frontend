<template>
  <div class="api-config-modal-container">
    <app-modal :open="open" :dismiss="dismiss">
      <div class="page">
        <h2>API 設定</h2>
        
        <div class="form-section">
          <label for="api-url-input">API 基礎網址</label>
          <input
            id="api-url-input"
            v-model="apiUrl"
            type="text"
            :placeholder="defaultUrl"
            class="url-input"
            data-testid="api-url-input"
          />
          <small class="help-text">
            留空將使用預設值：{{ defaultUrl }}
          </small>
        </div>

        <div class="button-section">
          <app-button @click="saveConfiguration" data-testid="save-button">
            儲存設定
          </app-button>
          <app-button 
            @click="resetToDefault" 
            :outline="true"
            data-testid="reset-button"
          >
            重置為預設值
          </app-button>
        </div>

        <div class="current-config">
          <strong>目前使用的 API 網址：</strong>
          <span class="current-url">{{ currentUrl }}</span>
        </div>
      </div>
    </app-modal>
  </div>
</template>

<script lang="ts">
import AppModal from '@/components/AppModal.vue'
import AppButton from '@/components/AppButton.vue'
import { createComponent, ref, computed } from '@vue/composition-api'
import { 
  getDefaultBaseURL, 
  getCustomBaseURL, 
  setCustomBaseURL, 
  resetToDefaultBaseURL, 
  currentBaseURL 
} from '@/lib/apiConfig'

export default createComponent({
  name: 'ApiConfigModal',
  components: {
    AppModal,
    AppButton
  },
  props: {
    open: {
      type: Boolean,
      default: false
    },
    dismiss: {
      type: Function
    }
  },
  setup (props) {
    const apiUrl = ref(getCustomBaseURL() || '')
    const defaultUrl = getDefaultBaseURL()
    const currentUrl = computed(() => currentBaseURL.value)

    const saveConfiguration = () => {
      const url = apiUrl.value.trim()
      if (url) {
        setCustomBaseURL(url)
      } else {
        resetToDefaultBaseURL()
      }
      
      if (props.dismiss) {
        props.dismiss()
      }
    }

    const resetToDefault = () => {
      apiUrl.value = ''
      resetToDefaultBaseURL()
      
      if (props.dismiss) {
        props.dismiss()
      }
    }

    return {
      apiUrl,
      defaultUrl,
      currentUrl,
      saveConfiguration,
      resetToDefault
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables';
@import '@/styles/page';

.api-config-modal-container .app-modal {
  max-width: 500px;
  width: 90%;
  
  .page {
    h2 {
      color: $primary-color;
      margin-bottom: 20px;
      text-align: center;
    }

    .form-section {
      margin-bottom: 20px;

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
        color: $font-color;
      }

      .url-input {
        width: 100%;
        padding: 12px;
        border: 2px solid $gray-light-color;
        border-radius: 4px;
        font-size: 16px;
        
        &:focus {
          outline: none;
          border-color: $primary-color;
        }
      }

      .help-text {
        display: block;
        margin-top: 6px;
        color: $gray-light-color;
        font-size: 14px;
        line-height: 1.4;
      }
    }

    .button-section {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;

      .app-button {
        flex: 1;
        min-width: 120px;
      }
    }

    .current-config {
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
      font-size: 14px;
      line-height: 1.4;

      .current-url {
        display: block;
        margin-top: 5px;
        word-break: break-all;
        color: $primary-color;
        font-family: monospace;
      }
    }
  }
}
</style>