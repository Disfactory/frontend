/* eslint-disable @typescript-eslint/no-explicit-any */
import { provide, inject } from 'vue'

const GASymbol = Symbol('GASymbol')

export function provideGA (context: any) {
  provide(GASymbol, (context.root as any).$gtag)
}

export function useGA () {
  const gtag: any = inject(GASymbol)

  if (!gtag) {
    throw new Error('use provideGA before useGA')
  }

  const pageview = (path: string) => {
    gtag.pageview({ page_path: path })
  }

  const event = (event: string, data: any = {}) => {
    gtag.event(event, data)
  }

  return { pageview, event }
}
