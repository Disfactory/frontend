type GAEventPayload = Record<string, unknown> & { event: string }

declare global {
  interface Window {
    dataLayer?: GAEventPayload[]
  }
}

export function useGA() {
  const push = (payload: GAEventPayload) => {
    window.dataLayer?.push(payload)
  }

  const pageview = (path: string) => {
    push({ event: 'page_view', page_path: path })
  }

  const event = (name: string, data: Record<string, unknown> = {}) => {
    push({ event: name, ...data })
  }

  return { pageview, event }
}
