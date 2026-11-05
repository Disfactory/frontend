import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useGA } from '@/lib/useGA'

export interface DeferredInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_AT_KEY = 'pwa-install-dismissed-at'
const INSTALLED_KEY = 'pwa-install-installed'
const RESHOW_AFTER_MS = 30 * 24 * 60 * 60 * 1000

export function detectIos(userAgent: string): boolean {
  return /(iPod|iPhone|iPad)/.test(userAgent) && /AppleWebKit/.test(userAgent)
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage?.getItem(key) ?? null
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage?.setItem(key, value)
  } catch {
    // storage unavailable (private mode); banner simply won't persist
  }
}

export const usePwaStore = defineStore('pwa', () => {
  const { event } = useGA()

  const deferredPrompt = ref<DeferredInstallPrompt | null>(null)
  const installed = ref(readStorage(INSTALLED_KEY) === 'true')
  const initialDismissedAt = (() => {
    const raw = readStorage(DISMISSED_AT_KEY)
    const parsed = raw === null ? Number.NaN : Number(raw)
    return Number.isFinite(parsed) ? parsed : null
  })()
  const dismissedAt = ref<number | null>(initialDismissedAt)
  let initialized = false

  const isStandalone = computed(
    () =>
      window.matchMedia?.('(display-mode: standalone)').matches === true ||
      (window.navigator as { standalone?: boolean }).standalone === true,
  )
  const isIos = computed(() => detectIos(window.navigator.userAgent))
  const canPromptNative = computed(() => deferredPrompt.value !== null)
  const dismissedRecently = computed(
    () =>
      dismissedAt.value !== null && Date.now() - dismissedAt.value < RESHOW_AFTER_MS,
  )
  const shouldPrompt = computed(
    () =>
      !isStandalone.value &&
      !installed.value &&
      !dismissedRecently.value &&
      (canPromptNative.value || isIos.value),
  )

  function onBeforeInstallPrompt(e: Event) {
    e.preventDefault()
    deferredPrompt.value = e as unknown as DeferredInstallPrompt
    event('pwaInstallAvailable')
  }

  function onAppInstalled() {
    installed.value = true
    deferredPrompt.value = null
    writeStorage(INSTALLED_KEY, 'true')
    event('pwaInstalled')
  }

  function init() {
    if (initialized) return
    initialized = true
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
  }

  async function promptInstall() {
    const promptEvent = deferredPrompt.value
    if (!promptEvent || typeof promptEvent.prompt !== 'function') return
    await promptEvent.prompt()
    const choice = await promptEvent.userChoice
    deferredPrompt.value = null
    event('pwaInstallChoice', { outcome: choice.outcome })
    if (choice.outcome === 'accepted') onAppInstalled()
  }

  function dismiss() {
    dismissedAt.value = Date.now()
    writeStorage(DISMISSED_AT_KEY, String(dismissedAt.value))
    event('pwaInstallDismissed')
  }

  return {
    deferredPrompt,
    installed,
    dismissedAt,
    isStandalone,
    isIos,
    canPromptNative,
    shouldPrompt,
    init,
    promptInstall,
    dismiss,
  }
})
