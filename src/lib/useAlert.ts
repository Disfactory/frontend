import { reactive } from 'vue'

enum AlertLevel {
  info = 'info',
  warn = 'warn',
  error = 'error'
}

type Alert = {
  level: AlertLevel,
  title: string,
  dismissText: string
}

type AlertState = {
  alert: Alert | null,
  timeout?: number
}

// Global alert state - simple reactive object without provide/inject
const alertState = reactive({
  alert: null as Alert | null,
  timeout: undefined as number | undefined
})

export const useAlertState = () => {
  const alertActions = {
    showAlert (title: string, timeouts = 3000, level: AlertLevel = AlertLevel.warn, dismissText = '此錯誤訊息將在3秒後消失。') {
      alertState.alert = {
        title,
        level,
        dismissText
      }

      if (alertState.timeout) {
        window.clearTimeout(alertState.timeout)
      }

      alertState.timeout = window.setTimeout(() => {
        alertState.alert = null
        alertState.timeout = undefined
      }, timeouts)
    },

    dismissAlert () {
      alertState.alert = null

      if (alertState.timeout) {
        window.clearTimeout(alertState.timeout)
        alertState.timeout = undefined
      }
    }
  }

  return [alertState, alertActions] as const
}
