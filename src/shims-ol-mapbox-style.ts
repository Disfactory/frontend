declare module 'ol-mapbox-style'

declare module 'ol-mapbox-style/dist/stylefunction' {
  import VectorLayer from 'ol/layer/Vector'
  import VectorTileLayer from 'ol/layer/VectorTile'
  import { StyleFunction } from 'ol/style/Style'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default function StyleFunction(olLayer: VectorLayer|VectorTileLayer, glStyle: string|Record<string, any>, source: string|Array<string>, resolutions?: Array<number>, spriteData?: Record<string, any>, spriteImageUrl?: Record<string, any>, getFonts?: (arg: Array<string>) => Array<string>): StyleFunction
}
