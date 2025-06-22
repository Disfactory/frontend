import { ref, computed } from 'vue'

const API_BASE_URL_KEY = 'api-base-url'

// Default API base URL (build-time value)
const defaultBaseURL = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BASE_URL : '/server/api'

// Reactive API base URL
const customBaseURL = ref<string | null>(localStorage.getItem(API_BASE_URL_KEY))

// Computed current base URL
export const currentBaseURL = computed(() => customBaseURL.value || defaultBaseURL)

// Get the default base URL
export const getDefaultBaseURL = (): string => defaultBaseURL

// Set custom base URL and save to localStorage
export const setCustomBaseURL = (url: string): void => {
  customBaseURL.value = url
  localStorage.setItem(API_BASE_URL_KEY, url)
}

// Reset to default base URL and remove from localStorage
export const resetToDefaultBaseURL = (): void => {
  customBaseURL.value = null
  localStorage.removeItem(API_BASE_URL_KEY)
}

// Get current custom base URL (null if using default)
export const getCustomBaseURL = (): string | null => customBaseURL.value