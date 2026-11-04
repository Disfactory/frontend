import { ref } from 'vue'
import { defineStore } from 'pinia'

export enum AlertLevel {
  info = 'info',
  warn = 'warn',
  error = 'error',
}

type Alert = {
  level: AlertLevel
  title: string
  dismissText: string
}

export const useAlertStore = defineStore('alerts', () => {
  const alert = ref<Alert | null>(null)
  const timeout = ref<number | undefined>(undefined)

  function dismissAlert() {
    alert.value = null
    if (timeout.value) {
      window.clearTimeout(timeout.value)
      timeout.value = undefined
    }
  }

  function showAlert(
    title: string,
    timeouts = 3000,
    level: AlertLevel = AlertLevel.warn,
    dismissText = '此錯誤訊息將在3秒後消失。',
  ) {
    alert.value = { title, level, dismissText }
    if (timeout.value) window.clearTimeout(timeout.value)
    timeout.value = window.setTimeout(() => {
      alert.value = null
      timeout.value = undefined
    }, timeouts)
  }

  return { alert, dismissAlert, showAlert }
})
