import { inject, InjectionKey, provide, Ref, ref } from '@vue/composition-api'
import { BASE_MAP } from './map'

const mapModeSymbol: InjectionKey<{ currentMapMode: Ref<BASE_MAP> }> = Symbol('MapModeSymbol')

export function provideMapMode () {
  const currentMapMode = ref(BASE_MAP.OSM)

  return provide(mapModeSymbol, { currentMapMode })
}

export function useMapMode () {
  const context = inject(mapModeSymbol)

  if (!context) {
    throw new Error('Please use provideMapMode before useMapMode.')
  }

  return context
}
