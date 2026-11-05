import { FACTORY_TYPE, type FactoryData } from '../types'

const factoryTypeMap: Record<string, string> = FACTORY_TYPE.reduce(
  (acc, obj) => ({ ...acc, [obj.value]: obj.text }),
  {},
)

export const getFactoryTypeText = (factory: FactoryData) => {
  if (factory.type) {
    return factoryTypeMap[factory.type] ?? null
  }
  return null
}
