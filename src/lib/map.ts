import OlMap from 'ol/Map'
import type { MapOptions } from 'ol/Map'
import type MapBrowserEvent from 'ol/MapBrowserEvent'
import Feature from 'ol/Feature'
import View from 'ol/View'
import { Style, Icon, Circle, Fill, Stroke, Text } from 'ol/style'
import Point from 'ol/geom/Point'
import WMTS from 'ol/source/WMTS'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { get as getProjection, transform, transformExtent } from 'ol/proj'
import { getWidth, getTopLeft } from 'ol/extent'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorTileLayer from 'ol/layer/VectorTile'
import { Vector as VectorSource, OSM, Cluster } from 'ol/source'
import VectorTileSource from 'ol/source/VectorTile'
import MVT from 'ol/format/MVT'
import { Zoom, ScaleLine, Rotate, Attribution } from 'ol/control'
import Geolocation from 'ol/Geolocation'
import { defaults as defaultInteractions, PinchRotate } from 'ol/interaction'
import { stylefunction } from 'ol-mapbox-style'

import {
  type FactoryData,
  type FactoryDisplayStatusType,
  FactoryDisplayStatuses,
  defaultFactoryDisplayStatuses,
} from '../types'
import { flipArgriculturalLand } from './image'
import { baseStyle } from './layerStyle'
import FactoryPointCache from './utils/factoryPointCache'

const getFactoryStatusImage = (status: FactoryDisplayStatusType) => `/images/marker-${status}.svg`

export const getStatusBorderColor = (status: FactoryDisplayStatusType) => {
  // We use == instead of === here because `type` can be either a string or number.
   
  return FactoryDisplayStatuses.find((s) => s.type == status)?.color
}

export function getFactoryStatus(factory: FactoryData): FactoryDisplayStatusType {
  if (factory.wont_fix) return FactoryDisplayStatuses[4]!.type
  if (factory.document_display_status) {
    return (
      (FactoryDisplayStatuses.find((s) =>
        s.documentDisplayStatuses.includes(factory.document_display_status!),
      )?.type as FactoryDisplayStatusType) ?? FactoryDisplayStatuses[0]!.type
    )
  }
  return FactoryDisplayStatuses[0]!.type
}

export enum BASE_MAP {
  OSM,
  TAIWAN,
  SATELITE,
  PROTOMAP,
}

export const BASE_MAP_NAME = {
  [BASE_MAP.OSM]: '簡易地圖',
  [BASE_MAP.TAIWAN]: '詳細地圖',
  [BASE_MAP.SATELITE]: '衛星地圖',
  [BASE_MAP.PROTOMAP]: '向量地圖',
}

type ButtonElements = {
  zoomIn: HTMLImageElement
  zoomOut: HTMLImageElement
}

const makeMapButtons = () =>
  Object.entries({
    zoomIn: '/images/zoom-in.svg',
    zoomOut: '/images/zoom-out.svg',
  }).reduce<Partial<ButtonElements>>((acc, [key, image]) => {
    const label = document.createElement('img')
    label.setAttribute('src', image)
    label.setAttribute('alt', key === 'zoomIn' ? '放大' : '縮小')
    return { ...acc, [key]: label }
  }, {}) as ButtonElements

const iconStyleMap = defaultFactoryDisplayStatuses.reduce(
  (acc, status) => ({
    ...acc,
    [status]: new Style({
      image: new Icon({
        anchorYUnits: 'pixels',
        anchorOrigin: 'bottom-left',
        src: getFactoryStatusImage(status),
      }),
      zIndex: defaultFactoryDisplayStatuses.indexOf(status),
    }),
  }),
  {},
) as { [key in FactoryDisplayStatusType]: Style }

const nullStyle = new Style({})

const minimapPinStyle = new Style({
  image: new Circle({
    fill: new Fill({ color: '#A22929' }),
    radius: 12,
    stroke: new Stroke({ color: '#FFFFFF', width: 1 }),
  }),
})

export const featureStyleCache = new Map<string, Style>()

export class MapFactoryController {
  private _map: OLMap
  private appliedFilters: FactoryDisplayStatusType[] = defaultFactoryDisplayStatuses
  private _factoriesLayerStatusMap: Record<string, VectorSource>
  private factoryMap = new Map<string, FactoryData>()

  constructor(map: OLMap) {
    this._map = map
    this._factoriesLayerStatusMap = {}
  }

  get mapInstance() {
    return this._map
  }

  get factories() {
    return [...this.factoryMap.values()]
  }

  getFactoriesLayerForStatus(factoryStatus: FactoryDisplayStatusType) {
    const CLUSTER_DISTANCE = 50
    if (!this._factoriesLayerStatusMap[`${factoryStatus}`]) {
      const source = new VectorSource({ features: [] })
      this._factoriesLayerStatusMap[`${factoryStatus}`] = source

      const clusterSource = new Cluster({ distance: CLUSTER_DISTANCE, source })
      const styleCache: Record<number, Style> = {}

      const vectorLayer = new VectorLayer({
        source: clusterSource,
        zIndex: 3,
        style: (feature, resolution) => {
          void resolution
          const zoom = this.mapInstance.map.getView().getZoom() ?? 0
          const clusterDistance = clusterSource.getDistance()

          if (zoom > 16 && clusterDistance !== 0) clusterSource.setDistance(0)
          else if (zoom <= 16 && clusterDistance !== CLUSTER_DISTANCE) {
            clusterSource.setDistance(CLUSTER_DISTANCE)
          }

          const features = feature.get('features') as Feature[]
          if (features.length > 1) {
            const size = features.length
            let style = styleCache[size]
            if (!style) {
              style = new Style({
                image: new Circle({
                  radius: 20,
                  stroke: new Stroke({ color: '#fff' }),
                  fill: new Fill({ color: getStatusBorderColor(factoryStatus) }),
                }),
                text: new Text({
                  text: size.toString(),
                  fill: new Fill({ color: '#fff' }),
                  scale: 1.8,
                }),
              })
              styleCache[size] = style
            }
            return style
          }

          const factoryFeature = features[0]!
          ;(feature as Feature).set('factoryId', factoryFeature.get('factoryId'))
          return (factoryFeature.getStyle() as Style) ?? undefined
        },
      })
      vectorLayer.setProperties({ factoryStatus })
      this.mapInstance.map.addLayer(vectorLayer)
    }

    return this._factoriesLayerStatusMap[`${factoryStatus}`]!
  }

  getFactory(id: string) {
    return this.factoryMap.get(id)
  }

  updateFactory(id: string, factory: FactoryData) {
    this.factoryMap.set(id, factory)
    const feature = this.getFactoriesLayerForStatus(getFactoryStatus(factory)).getFeatureById(id)
    if (feature) {
      const style = this.getFactoryStyle(factory)
      featureStyleCache.set(id, style.clone())
      feature.setStyle(style)
    }
  }

  addFactories(factories: FactoryData[]) {
    const factoriesToAdd: FactoryData[] = []
    factories.forEach((factory) => {
      if (!this.factoryMap.has(factory.id)) factoriesToAdd.push(factory)
    })

    const features = factoriesToAdd
      .map((factory) => this.createFactoryFeature(factory))
      .filter(Boolean) as Feature[]

    const featuresByFactoryStatus: Record<string, Feature[]> = {}
    features.forEach((feature) => {
      const status = feature.get('factoryStatus') as string
      featuresByFactoryStatus[status] ??= []
      featuresByFactoryStatus[status].push(feature)
    })

    Object.entries(featuresByFactoryStatus).forEach(([status, statusFeatures]) => {
      this.getFactoriesLayerForStatus(status as FactoryDisplayStatusType).addFeatures(
        statusFeatures,
      )
    })
  }

  hideFactories(factories: FactoryData[]) {
    factories.forEach((factory) => {
      const feature = this.getFactoriesLayerForStatus(getFactoryStatus(factory)).getFeatureById(
        factory.id,
      )
      feature?.setStyle(nullStyle)
    })
  }

  setFactoryStatusFilter(filters: FactoryDisplayStatusType[]) {
    this.appliedFilters = filters

    this.mapInstance.map.getLayers().forEach((layer) => {
      const status = layer.get('factoryStatus') as FactoryDisplayStatusType | undefined
      if (status === undefined) return
      const comparable = status === 'default' ? status : (Number(status) as FactoryDisplayStatusType)
      layer.setVisible(filters.includes(comparable))
    })

    this.updateFactoriesFeatureStyle()
  }

  private isFactoryVisible(factory: FactoryData) {
    return this.appliedFilters.includes(getFactoryStatus(factory))
  }

  private getFactoryStyle(factory: FactoryData): Style {
    return this.isFactoryVisible(factory) ? iconStyleMap[getFactoryStatus(factory)] : nullStyle
  }

  private createFactoryFeature(factory: FactoryData) {
    if (FactoryPointCache.getFactoryCache(factory)) return null

    const feature = new Feature({
      geometry: new Point(transform([factory.lng, factory.lat], 'EPSG:4326', 'EPSG:3857')),
    })
    feature.setId(factory.id)
    feature.set('factoryId', factory.id)
    feature.set('factoryStatus', getFactoryStatus(factory))

    const style = this.getFactoryStyle(factory)
    featureStyleCache.set(factory.id, style.clone())
    feature.setStyle(style)
    this.factoryMap.set(factory.id, factory)
    FactoryPointCache.setFactoryCache(factory, feature)
    return feature
  }

  private forEachFeatureFactory(fn: (feature: Feature, factory: FactoryData) => void) {
    Object.values(this._factoriesLayerStatusMap).forEach((layerSource) => {
      layerSource.getFeatures().forEach((feature) => {
        const id = feature.getId() as string
        const factory = this.factoryMap.get(id)
        if (factory) fn(feature, factory)
      })
    })
  }

  private updateFactoriesFeatureStyle() {
    this.forEachFeatureFactory((feature, factory) => {
      feature.setStyle(this.getFactoryStyle(factory))
    })
  }
}

const getWMTSTileGrid = () => {
  const projection = getProjection('EPSG:3857')!
  const projectionExtent = projection.getExtent()
  const resolutions: number[] = []
  const size = getWidth(projectionExtent) / 256
  const matrixIds: string[] = []
  for (let z = 0; z < 21; ++z) {
    resolutions.push(size / Math.pow(2, z))
    matrixIds.push(String(z))
  }

  return new WMTSTileGrid({
    origin: getTopLeft(projectionExtent),
    resolutions,
    matrixIds,
  })
}

const getBaseLayer = (type: BASE_MAP, wmtsTileGrid: WMTSTileGrid) => {
  if (type === BASE_MAP.PROTOMAP) {
    const taiwanExtent = transformExtent(
      [119.90423060095736, 21.83090666506977, 122.2876172488333, 25.33409668479448],
      'EPSG:4326',
      'EPSG:3857',
    )
    const layer = new VectorTileLayer({
      source: new VectorTileSource({
        attributions:
          '<a href="https://protomaps.com" target="_blank">Protomaps</a> © <a href="https://www.openstreetmap.org" target="_blank"> OpenStreetMap</a>',
        format: new MVT(),
        url:
          import.meta.env.VITE_PROTOMAP_SOURCE_URL ||
          'https://api.disfactory.tw/tiles/{z}/{x}/{y}.pbf',
        maxZoom: 14,
      }),
      opacity: 1,
      zIndex: 1,
      renderMode: 'vector',
    })
    layer.setExtent(taiwanExtent)
    stylefunction(layer, baseStyle, 'protomaps')
    return layer
  }

  const source = (() => {
    switch (type) {
      case BASE_MAP.TAIWAN:
        return new WMTS({
          matrixSet: 'EPSG:3857',
          format: 'image/png',
          url: 'https://wmts.nlsc.gov.tw/wmts',
          layer: 'EMAP',
          tileGrid: wmtsTileGrid,
          crossOrigin: 'Anonymous',
          style: 'default',
          wrapX: true,
          attributions:
            '<a href="https://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>',
        })
      case BASE_MAP.SATELITE:
        return new WMTS({
          matrixSet: 'EPSG:3857',
          format: 'image/png',
          url: 'https://wmts.nlsc.gov.tw/wmts/PHOTO_MIX/default/EPSG:3857/{TileMatrix}/{TileRow}/{TileCol}',
          layer: 'EMAP',
          tileGrid: wmtsTileGrid,
          requestEncoding: 'REST',
          crossOrigin: 'Anonymous',
          style: 'default',
          wrapX: true,
          attributions:
            '<a href="https://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>',
        })
      default:
        return new OSM({
          crossOrigin: 'Anonymous',
          attributions:
            '<a href="https://osm.tw/" target="_blank">OpenStreetMap 台灣</a>',
        })
    }
  })()

  return new TileLayer({ source, opacity: 0.6, zIndex: 1 })
}

const getLUIMapLayer = (wmtsTileGrid: WMTSTileGrid) =>
  new TileLayer({
    source: new WMTS({
      matrixSet: 'EPSG:3857',
      format: 'image/png',
      url: 'https://wmts.nlsc.gov.tw/wmts/nURBAN2/default/EPSG:3857/{TileMatrix}/{TileRow}/{TileCol}',
      layer: 'LUIMAP',
      requestEncoding: 'REST',
      tileGrid: wmtsTileGrid,
      tileLoadFunction(imageTile, src) {
        const image = (imageTile as unknown as { getImage: () => HTMLImageElement }).getImage()
        flipArgriculturalLand(src).then((newSrc) => {
          image.src = newSrc
        })
      },
      crossOrigin: 'Anonymous',
      style: 'default',
      wrapX: true,
      attributions:
        '<a href="https://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>',
    }),
    opacity: 0.5,
    zIndex: 2,
    className: 'lui-layer',
  })

type MapEventHandler = {
  onMoved?: (location: [number, number, number, number], canPlaceFactory: boolean) => void
  onClicked?: (location: [number, number], feature?: Feature) => void
  onZoomed?: (zoom: number) => void
  onLUILayerVisibilityChange?: (visible: boolean) => void
}

type OLMapOptions = {
  minimap?: boolean
  getInitialLocation?: () => [number, number, number] | undefined
}

export class OLMap {
  private _map: OlMap
  private mapDom: HTMLElement
  private geolocation?: Geolocation
  private baseLayer: TileLayer | VectorTileLayer
  private tileGrid: WMTSTileGrid = getWMTSTileGrid()
  private luiLayer!: TileLayer
  private minimapPinFeature?: Feature
  private hasInitialLocation = false

  constructor(target: HTMLElement, handler: MapEventHandler = {}, options: OLMapOptions = {}) {
    this.mapDom = target
    this.baseLayer = getBaseLayer(BASE_MAP.OSM, this.tileGrid)
    this._map = this.instantiateOLMap(this.mapDom, this.baseLayer, options)

    if (!options.minimap) this.geolocation = this.setupGeolocationTracking(this._map)
    this.setupEventListeners(this._map, handler)
  }

  get map() {
    return this._map
  }

  private setupEventListeners(map: OlMap, handler: MapEventHandler) {
    const move = async () => {
      const view = map.getView()
      const zoom = view.getZoom() ?? 0
      const resolution = view.getResolutionForZoom(zoom)
      const range = Math.ceil(resolution / 2)
      const center = view.getCenter()
      if (!center) return

      const [lng, lat] = transform(center, 'EPSG:3857', 'EPSG:4326')
      const lngValue = lng as number
      const latValue = lat as number

      if (handler.onMoved) {
        const { width, height } = this.mapDom.getBoundingClientRect()
        const canPlace = await this.canPlaceFactory([width / 2, height / 2])
        handler.onMoved([lngValue, latValue, range, zoom], canPlace)
      }
    }

    map.getView().on('change:resolution', () => {
      void move()
    })

    const onMapEvent = (type: string, listener: () => void) => {
      ;(map as unknown as { on: (t: string, l: () => void) => void }).on(type, listener)
    }

    onMapEvent('moveend', () => {
      void move()
    })
    onMapEvent('rendercomplete', () => {
      void move()
    })

    onMapEvent('zoomend', () => {
      const zoom = map.getView().getZoom() ?? 0
      handler.onZoomed?.(zoom)
    })

    map.on('click', (event) => {
      if (!handler.onClicked) return
      const [lng, lat] = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326')
      const feature = map.forEachFeatureAtPixel(
        event.pixel,
        (candidate) => candidate,
        { layerFilter: (layer) => layer.getZIndex() !== 5 },
      )
      handler.onClicked([lng as number, lat as number], feature as Feature | undefined)
    })

    map.on('pointermove', (event) => {
      if (!event.dragging) {
        const target = map.getTargetElement()
        if (target) {
          target.style.cursor = map.hasFeatureAtPixel(map.getEventPixel(event.originalEvent))
            ? 'pointer'
            : ''
        }
      }
    })

    this.luiLayer.on('change:visible', () => {
      handler.onLUILayerVisibilityChange?.(this.luiLayer.getVisible())
    })
  }

  setCoordinate(longitude: number, latitude: number, zoom?: number) {
    const view = this.map.getView()
    view.setCenter(transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'))
    view.setZoom(zoom ?? view.getZoom() ?? 14)
  }

  private instantiateOLMap(
    target: HTMLElement,
    baseLayer: TileLayer | VectorTileLayer,
    options: OLMapOptions = {},
  ) {
    const tileGrid = getWMTSTileGrid()
    const initial = options.getInitialLocation?.()

    const view = initial
      ? (() => {
          const [longitude, latitude, zoom] = initial
          this.hasInitialLocation = true
          return new View({
            center: transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'),
            zoom,
          })
        })()
      : new View({
          center: transform([120.48504632216294, 24.088258816482295], 'EPSG:4326', 'EPSG:3857'),
          zoom: 14,
        })

    const mapControlButtons = makeMapButtons()
    this.luiLayer = getLUIMapLayer(tileGrid)

    const mapOptions: MapOptions = {
      target,
      layers: [baseLayer, this.luiLayer],
      view,
      controls: [
        new Zoom({
          zoomInLabel: mapControlButtons.zoomIn,
          zoomOutLabel: mapControlButtons.zoomOut,
          zoomInTipLabel: '放大',
          zoomOutTipLabel: '縮小',
        }),
        new ScaleLine(),
        new Rotate(),
        new Attribution(),
      ],
      interactions: defaultInteractions({ pinchRotate: false }).extend([
        new PinchRotate({ threshold: 0.4 }),
      ]),
    }

    if (options.minimap) {
      mapOptions.controls = []
      mapOptions.interactions = []
    }

    return new OlMap(mapOptions)
  }

  private setupGeolocationTracking(map: OlMap) {
    const view = map.getView()
    const geolocation = new Geolocation({
      trackingOptions: { enableHighAccuracy: true },
      projection: view.getProjection(),
    })
    geolocation.setTracking(true)

    const positionLayer = this.setupGeolocationLayer(geolocation)
    map.addLayer(positionLayer)
    return geolocation
  }

  private setupGeolocationLayer(geolocation: Geolocation) {
    const positionFeature = new Feature()
    const getPositionStyles = (heading: number) =>
      !Number.isNaN(heading)
        ? new Style({
            image: new Icon({
              anchor: [0.5, 0.5],
              src: '/images/now.svg',
              rotation: heading,
              rotateWithView: true,
            }),
          })
        : new Style({
            image: new Circle({
              fill: new Fill({ color: '#0099ff' }),
              stroke: new Stroke({ color: '#fff', width: 3 }),
              radius: 15,
            }),
          })

    positionFeature.setStyle(getPositionStyles(NaN))
    geolocation.on('change:position', () => {
      const coordinates = geolocation.getPosition()
      positionFeature.setGeometry(coordinates ? new Point(coordinates) : undefined)
    })
    geolocation.on('change:heading', () => {
      positionFeature.setStyle(getPositionStyles(geolocation.getHeading() ?? NaN))
    })

    const accuracyFeature = new Feature()
    geolocation.on('change:accuracyGeometry', () => {
      accuracyFeature.setGeometry(geolocation.getAccuracyGeometry() ?? undefined)
    })

    let run = this.hasInitialLocation
    geolocation.on('change', () => {
      if (run) return
      if (geolocation.getPosition()) {
        this.zoomToGeolocation()
        run = true
      }
    })

    return new VectorLayer({
      source: new VectorSource({ features: [positionFeature, accuracyFeature] }),
      zIndex: 5,
    })
  }

  zoomToGeolocation() {
    if (!this.geolocation) throw new Error('No location permission')
    const location = this.geolocation.getPosition()
    if (!location) throw new Error('No location permission')

    const view = this._map.getView()
    view.setCenter(location)
    view.setZoom(16)
  }

  changeBaseMap(type: BASE_MAP) {
    this._map.removeLayer(this.baseLayer)
    this.baseLayer = getBaseLayer(type, this.tileGrid)
    this._map.addLayer(this.baseLayer)
  }

  async canPlaceFactory(pixel: MapBrowserEvent['pixel']): Promise<boolean> {
    // The LUIMAP layer paints agricultural land transparent and everything
    // else opaque. Sample the layer canvas to decide whether the centre of
    // the screen is inside an agricultural zone.
    const viewport = this._map.getViewport()
    if (!viewport) return true

    const layerElement = viewport.querySelector('.lui-layer') as HTMLElement | null
    const canvas = layerElement?.querySelector('canvas') ?? null
    if (!canvas) return true

    const context = canvas.getContext('2d')
    if (!context) return true

    const canvasRect = canvas.getBoundingClientRect()
    const mapRect = viewport.getBoundingClientRect()
    const x = Math.round(
      ((pixel[0] as number) + mapRect.left - canvasRect.left) *
        (canvas.width / canvasRect.width),
    )
    const y = Math.round(
      ((pixel[1] as number) + mapRect.top - canvasRect.top) *
        (canvas.height / canvasRect.height),
    )

    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return true

    const data = context.getImageData(x, y, 1, 1).data
    return (data[3] ?? 0) < 128
  }

  private getLUIMAPLayer() {
    if (!this.luiLayer) throw new TypeError('LUIMAP Layer not found')
    return this.luiLayer
  }

  setLUILayerVisible(visible: boolean) {
    this.getLUIMAPLayer().setVisible(visible)
  }

  getLUILayerVisible() {
    return this.getLUIMAPLayer().getVisible()
  }

  setMinimapPin(longitude: number, latitude: number) {
    const coordinate = transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857')

    if (!this.minimapPinFeature) {
      const feature = new Feature({ geometry: new Point(coordinate) })
      feature.setStyle(minimapPinStyle)
      this.minimapPinFeature = feature
      const source = new VectorSource({ features: [feature] })
      this.map.addLayer(new VectorLayer({ source, zIndex: 4 }))
    } else {
      this.minimapPinFeature.setGeometry(new Point(coordinate))
    }

    this._map.getView().setCenter(coordinate)
  }
}

export function initializeMap(
  target: HTMLElement,
  handler: MapEventHandler = {},
  options: OLMapOptions = {},
) {
  const mapInstance = new OLMap(target, handler, options)
  return new MapFactoryController(mapInstance)
}

export function initializeMinimap(target: HTMLElement, center: number[]) {
  const mapInstance = new OLMap(target, {}, { minimap: true })
  mapInstance.map.getView().setCenter(center)
  return new MapFactoryController(mapInstance)
}
