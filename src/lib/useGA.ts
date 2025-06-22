/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCurrentInstance } from 'vue'

export function useGA () {
  const instance = getCurrentInstance()
  const gtag = (instance?.proxy as any)?.$gtag

  const pageview = (path: string) => {
    if (gtag) {
      gtag.pageview({ page_path: path })
    }
  }

  const event = (event: string, data: any = {}) => {
    if (gtag) {
      gtag.event(event, data)
    }
  }

  return { pageview, event }
}
