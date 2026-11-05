import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { detectIos, usePwaStore } from '../pwa'

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1'
const DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

function stubUserAgent(value: string) {
  Object.defineProperty(window.navigator, 'userAgent', {
    value,
    configurable: true,
  })
}

function stubMatchMedia(matches: boolean) {
  window.matchMedia = vi
    .fn<(query: string) => MediaQueryList>()
    .mockReturnValue({
      matches,
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>(),
    } as unknown as MediaQueryList) as unknown as typeof window.matchMedia
}

function fakePromptEvent(outcome: 'accepted' | 'dismissed' = 'accepted') {
  const e = new Event('beforeinstallprompt')
  const prompt = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
  Object.assign(e, {
    prompt,
    userChoice: Promise.resolve({ outcome }),
  })
  return { event: e, prompt }
}

function ensureLocalStorage() {
  if (window.localStorage) return
  const backing = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => backing.get(key) ?? null,
      setItem: (key: string, value: string) => void backing.set(key, String(value)),
      removeItem: (key: string) => void backing.delete(key),
      clear: () => backing.clear(),
    },
    configurable: true,
  })
}

describe('detectIos', () => {
  it('recognizes iOS WebKit user agents', () => {
    expect(detectIos(IPHONE_UA)).toBe(true)
    expect(detectIos(DESKTOP_UA)).toBe(false)
  })
})

describe('pwa store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    ensureLocalStorage()
    window.localStorage.clear()
    stubUserAgent(DESKTOP_UA)
    stubMatchMedia(false)
  })

  it('stays hidden without a prompt on desktop', () => {
    const store = usePwaStore()
    store.init()
    expect(store.shouldPrompt).toBe(false)
  })

  it('shows after capturing beforeinstallprompt', () => {
    const store = usePwaStore()
    store.init()
    window.dispatchEvent(new Event('beforeinstallprompt'))
    expect(store.canPromptNative).toBe(true)
    expect(store.shouldPrompt).toBe(true)
  })

  it('persists dismissal and re-shows after 30 days', () => {
    const store = usePwaStore()
    store.init()
    window.dispatchEvent(new Event('beforeinstallprompt'))
    store.dismiss()
    expect(store.shouldPrompt).toBe(false)
    expect(window.localStorage.getItem('pwa-install-dismissed-at')).not.toBeNull()

    setActivePinia(createPinia())
    const reopened = usePwaStore()
    reopened.init()
    window.dispatchEvent(new Event('beforeinstallprompt'))
    expect(reopened.shouldPrompt).toBe(false)

    window.localStorage.setItem(
      'pwa-install-dismissed-at',
      String(Date.now() - 31 * 24 * 60 * 60 * 1000),
    )
    setActivePinia(createPinia())
    const later = usePwaStore()
    later.init()
    window.dispatchEvent(new Event('beforeinstallprompt'))
    expect(later.shouldPrompt).toBe(true)
  })

  it('installs through the deferred prompt and remembers it', async () => {
    const store = usePwaStore()
    store.init()
    const { event: e, prompt } = fakePromptEvent('accepted')
    window.dispatchEvent(e)
    await store.promptInstall()
    expect(prompt).toHaveBeenCalled()
    expect(store.installed).toBe(true)
    expect(store.shouldPrompt).toBe(false)

    setActivePinia(createPinia())
    const reopened = usePwaStore()
    reopened.init()
    window.dispatchEvent(new Event('beforeinstallprompt'))
    expect(reopened.shouldPrompt).toBe(false)
  })

  it('keeps the banner when the user dismisses the native prompt', async () => {
    const store = usePwaStore()
    store.init()
    window.dispatchEvent(fakePromptEvent('dismissed').event)
    await store.promptInstall()
    expect(store.installed).toBe(false)
    expect(store.shouldPrompt).toBe(false)
  })

  it('ignores promptInstall without a stashed event', async () => {
    const store = usePwaStore()
    store.init()
    await expect(store.promptInstall()).resolves.toBeUndefined()
    expect(store.installed).toBe(false)
  })

  it('marks installed on appinstalled', () => {
    const store = usePwaStore()
    store.init()
    window.dispatchEvent(new Event('beforeinstallprompt'))
    window.dispatchEvent(new Event('appinstalled'))
    expect(store.installed).toBe(true)
    expect(store.shouldPrompt).toBe(false)
  })

  it('shows iOS guidance without a native prompt', () => {
    stubUserAgent(IPHONE_UA)
    const store = usePwaStore()
    store.init()
    expect(store.isIos).toBe(true)
    expect(store.shouldPrompt).toBe(true)
  })

  it('stays hidden in standalone mode', () => {
    stubMatchMedia(true)
    const store = usePwaStore()
    store.init()
    window.dispatchEvent(new Event('beforeinstallprompt'))
    expect(store.isStandalone).toBe(true)
    expect(store.shouldPrompt).toBe(false)
  })
})
