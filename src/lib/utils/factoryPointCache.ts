import { FactoryData } from '@/types'
import Feature from 'ol/Feature'

const featurePointCachedByCoord = new Map<string, Feature>()
export class FactoryPointCache {
  static getFactoryCacheKey (factory: FactoryData) {
    return `${factory.lat},${factory.lng}`
  }

  static getFactoryCache (factory: FactoryData) {
    return featurePointCachedByCoord.get(this.getFactoryCacheKey(factory))
  }

  static setFactoryCache (factory: FactoryData, feature: Feature) {
    featurePointCachedByCoord.set(this.getFactoryCacheKey(factory), feature)
  }
}

export default FactoryPointCache
