import { ref, computed } from 'vue'

const API_BASE_URL_KEY = 'api-base-url'

// In development we proxy `/server` to staging via Vite.
const defaultBaseURL = import.meta.env.DEV ? '/server/api' : import.meta.env.VITE_BASE_URL

const storedBaseURL = typeof window !== 'undefined' ? (window.localStorage?.getItem(API_BASE_URL_KEY) ?? null) : null
const customBaseURL = ref<string | null>(storedBaseURL)

export const currentBaseURL = computed(() => customBaseURL.value || defaultBaseURL)

export const getDefaultBaseURL = (): string => defaultBaseURL

export const setCustomBaseURL = (url: string): void => {
  customBaseURL.value = url
  window.localStorage?.setItem(API_BASE_URL_KEY, url)
}

export const resetToDefaultBaseURL = (): void => {
  customBaseURL.value = null
  window.localStorage?.removeItem(API_BASE_URL_KEY)
}

export const getCustomBaseURL = (): string | null => customBaseURL.value
