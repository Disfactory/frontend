import { getFactory } from '@/api'
import type { MapFactoryController } from './map'

export function parseHashParams(hash: string): Record<string, string> {
  const hashContent = /^#(.+)/.exec(hash)
  if (!hashContent) return {}

  return (hashContent[1] ?? '').split('&').reduce<Record<string, string>>((acc, kv) => {
    const [key, value] = kv.split('=')
    if (key) acc[key] = value ?? ''
    return acc
  }, {})
}

export function stringifyHash(obj: Record<string, string>): string {
  return '#' + Object.entries(obj).map(([key, value]) => `${key}=${value}`).join('&')
}

type PermaLinkState = {
  lat?: number
  lng?: number
  zoom?: number
}

const state: PermaLinkState = {}

export const permalink = {
  load(loc: Location) {
    const { map } = parseHashParams(loc.hash)
    const match = /([\d.]+)\/([\d.]+)\/([\d.]+)$/.exec(map ?? '')
    if (match) {
      state.zoom = parseFloat(match[1] ?? '0')
      state.lng = parseFloat(match[2] ?? '0')
      state.lat = parseFloat(match[3] ?? '0')
    }
  },

  dumps() {
    const required: (keyof PermaLinkState)[] = ['lat', 'lng', 'zoom']
    if (required.some((key) => typeof state[key] === 'undefined')) return ''
    return `#map=${state.zoom?.toFixed(2)}/${state.lng}/${state.lat}`
  },

  lng(value?: number) {
    if (typeof value !== 'undefined') state.lng = value
    return state.lng
  },
  lat(value?: number) {
    if (typeof value !== 'undefined') state.lat = value
    return state.lat
  },
  zoom(value?: number) {
    if (typeof value !== 'undefined') state.zoom = value
    return state.zoom
  },
}

export async function moveToSharedFactory(
  mapController: MapFactoryController,
  location: Location,
  cb: (factoryId: string) => void,
) {
  const { factoryId, ...others } = parseHashParams(location.hash)
  if (!factoryId) return

  const factoryData = await getFactory(factoryId)
  if (!factoryData) return

  mapController.addFactories([factoryData])
  mapController.mapInstance.setCoordinate(factoryData.lng, factoryData.lat)
  location.hash = stringifyHash(others)
  cb(factoryId)
}
