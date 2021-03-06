import { getFactory } from '@/api'
import { MapFactoryController } from './map'

export function parseHashParams (hash: string): { [key: string]: string } {
  const hashContent = /^#(.+)/.exec(hash)

  if (!hashContent) {
    return {}
  }

  return hashContent[1].split('&').reduce((acc, kv) => {
    const [key, value] = kv.split('=')
    return ({
      ...acc,
      [key]: value
    })
  }, {})
}

export function stringifyHash (obj: { [key: string]: string }): string {
  return '#' + Object.entries(obj).map(([key, value]) => {
    return `${key}=${value}`
  }).join('&')
}

// https://github.com/teia-tw/drinking_water/blob/f2fe7962bf9a48438eec5068e8bfe8b320f5b7e7/app.js#L6-L36

type PermaLinkState = {
  lat?: number,
  lng?: number,
  zoom?: number
}
const fields: (keyof PermaLinkState)[] = ['lat', 'lng', 'zoom']

type KeyFn<T> = { [P in keyof Required<T>]: () => number | void }

export const permalink = new class implements KeyFn<PermaLinkState> {
  s: PermaLinkState = {}

  load (loc: Location) {
    const { map } = parseHashParams(loc.hash)
    const m = /([\d.]+)\/([\d.]+)\/([\d.]+)$/.exec(map)
    if (m !== null) {
      this.s.zoom = parseFloat(m[1])
      this.s.lng = parseFloat(m[2])
      this.s.lat = parseFloat(m[3])
    }
  }

  dumps () {
    if (fields.some(f => typeof this.s[f] === 'undefined')) {
      return ''
    }
    return `#map=${this.s.zoom?.toFixed(2)}/${this.s.lng}/${this.s.lat}`
  }

  defineGetterSetter (key: keyof PermaLinkState) {
    return (...args: number[]) => {
      if (args.length > 0) {
        this.s[key] = args[0]
      }
      return this.s[key]
    }
  }

  lng = this.defineGetterSetter('lng')
  lat = this.defineGetterSetter('lat')
  zoom = this.defineGetterSetter('zoom')
}()

export async function moveToSharedFactory (mapController: MapFactoryController, location: Location, cb: (factoryId: string) => void) {
  const { factoryId, ...others } = parseHashParams(location.hash)

  if (!factoryId) {
    return
  }

  const factoryData = await getFactory(factoryId)

  if (!factoryData) {
    return
  }

  mapController.addFactories([factoryData])

  mapController.mapInstance.setCoordinate(factoryData.lng, factoryData.lat)

  location.hash = stringifyHash(others)

  cb(factoryId)
}
