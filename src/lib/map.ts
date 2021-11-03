import { Map as OlMap, View, Feature, MapBrowserEvent } from 'ol'
import { Style, Icon, Circle, Fill, Stroke, Text } from 'ol/style'
import IconAnchorUnits from 'ol/style/IconAnchorUnits'
import { Point } from 'ol/geom'
import WMTS from 'ol/source/WMTS'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { get as getProjection, transform, transformExtent } from 'ol/proj'
import { getWidth, getTopLeft } from 'ol/extent'
import { Tile as TileLayer, Vector as VectorLayer, Layer } from 'ol/layer'
import { Vector as VectorSource, OSM, Cluster } from 'ol/source'
import { Zoom, ScaleLine, Rotate, Attribution } from 'ol/control'
import Geolocation from 'ol/Geolocation'
import { defaults as defaultInteractions, PinchRotate } from 'ol/interaction'

import { FactoryData, defaultFactoryDisplayStatuses, FactoryDisplayStatusType, FactoryDisplayStatuses } from '../types'
import { flipArgriculturalLand } from '../lib/image'
import { MapOptions } from 'ol/PluggableMap'
import IconOrigin from 'ol/style/IconOrigin'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorTileSource from 'ol/source/VectorTile'
import MVT from 'ol/format/MVT'
import VectorTileRenderType from 'ol/layer/VectorTileRenderType'
import stylefunction from 'ol-mapbox-style/dist/stylefunction'
import { baseStyle } from './layerStyle'

const getFactoryStatusImage = (status: FactoryDisplayStatusType) => `/images/marker-${status}.svg`
export const getStatusBorderColor = (status: FactoryDisplayStatusType) => {
  // We use == instead of === here because `type` can be either a string or number
  // == results in a form of typecasting that works good enough for here
  // eslint-disable-next-line
  return FactoryDisplayStatuses.find(s => s.type == status)?.color
}

export function getFactoryStatus (factory: FactoryData): FactoryDisplayStatusType {
  if (factory.document_display_status) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return FactoryDisplayStatuses.find(s => s.documentDisplayStatuses.includes(factory.document_display_status!))?.type as FactoryDisplayStatusType
  } else {
    return FactoryDisplayStatuses[0].type
  }
}

export enum BASE_MAP {
  OSM,
  TAIWAN,
  SATELITE,
  PROTOMAP
}

export const BASE_MAP_NAME = {
  [BASE_MAP.OSM]: '簡易地圖',
  [BASE_MAP.TAIWAN]: '詳細地圖',
  [BASE_MAP.SATELITE]: '衛星地圖',
  [BASE_MAP.PROTOMAP]: '向量地圖'
}

type ButtonElements = {
  zoomIn: HTMLImageElement,
  zoomOut: HTMLImageElement
}

const makeMapButtons = () => {
  return Object.entries({
    zoomIn: '/images/zoom-in.svg',
    zoomOut: '/images/zoom-out.svg'
  }).reduce((acc, [key, image]) => {
    const label = document.createElement('img')
    label.setAttribute('src', image)
    label.setAttribute('alt',
      key === 'zoomIn' ? '放大' : '縮小')

    return {
      ...acc,
      [key]: label
    }
  }, {}) as ButtonElements
}

const iconStyleMap = defaultFactoryDisplayStatuses.reduce((acc, status) => ({
  ...acc,
  [status]: new Style({
    image: new Icon({
      anchorYUnits: IconAnchorUnits.PIXELS,
      anchorOrigin: IconOrigin.BOTTOM_LEFT,
      src: getFactoryStatusImage(status)
    }),
    zIndex: defaultFactoryDisplayStatuses.indexOf(status)
  })
}), {}) as {[key in FactoryDisplayStatusType]: Style}

const nullStyle = new Style({})

const minimapPinStyle = new Style({
  image: new Circle({
    fill: new Fill({
      color: '#A22929'
    }),
    radius: 12,
    stroke: new Stroke({
      color: '#FFFFFF',
      width: 1
    })
  })
})

export const featureStyleCache = new Map<string, Style>()

export class MapFactoryController {
  private _map: OLMap
  private appliedFilters: FactoryDisplayStatusType[] = defaultFactoryDisplayStatuses
  private _factoriesLayerSource?: VectorSource
  private _factoriesLayerStatusMap: {[key: string]: VectorSource}
  private factoryMap = new Map<string, FactoryData>()

  constructor (map: OLMap) {
    this._map = map
    this._factoriesLayerStatusMap = {} as {[key: string]: VectorSource}
  }

  get mapInstance () {
    return this._map
  }

  get factories () {
    return [...this.factoryMap.values()]
  }

  getFactoriesLayerForStatus (factoryStatus: FactoryDisplayStatusType) {
    if (!this._factoriesLayerStatusMap[`${factoryStatus}`]) {
      this._factoriesLayerStatusMap[`${factoryStatus}`] = new VectorSource({ features: [] })
      const clusterSource = new Cluster({
        distance: 50,
        source: this._factoriesLayerStatusMap[`${factoryStatus}`]
      })
      const styleCache = {}
      const vectorLayer = new VectorLayer({
        source: clusterSource,
        zIndex: 3,
        style: function (feature) {
          const features = feature.get('features')
          if (features.length > 1) {
            const size = features.length
            // eslint-disable-next-line
            // @ts-ignore
            let style = styleCache[size]
            if (!style) {
              style = new Style({
                image: new Circle({
                  radius: 20,
                  stroke: new Stroke({
                    color: '#fff'
                  }),
                  fill: new Fill({
                    color: getStatusBorderColor(factoryStatus)
                  })
                }),
                text: new Text({
                  text: size.toString(),
                  fill: new Fill({
                    color: '#fff'
                  }),
                  scale: 1.8
                })
              })
              // eslint-disable-next-line
              // @ts-ignore
              styleCache[size] = style
            }
            return style
          } else {
            const factoryFeature = features[0]
            ;(feature as Feature).set('factoryId', factoryFeature.get('factoryId'))
            return factoryFeature.getStyle()
          }
        }
      })
      vectorLayer.setProperties({ factoryStatus })
      this.mapInstance.map.addLayer(vectorLayer)
    }
    return this._factoriesLayerStatusMap[`${factoryStatus}`]
  }

  public getFactory (id: string) {
    return this.factoryMap.get(id)
  }

  public updateFactory (id: string, factory: FactoryData) {
    this.factoryMap.set(id, factory)

    // Update factory feature style base on new data
    const feature = this.getFactoriesLayerForStatus(getFactoryStatus(factory)).getFeatureById(id)
    if (feature) {
      const style = this.getFactoryStyle(factory)
      featureStyleCache.set(id, style.clone())
      feature.setStyle(style)
    }
  }

  public addFactories (factories: FactoryData[]) {
    const createFactoryFeature = this.createFactoryFeature.bind(this)
    const factoriesToAdd = [] as FactoryData[]
    const factoriesToUpdate = [] as FactoryData[]

    factories.forEach(factory => {
      if (this.factoryMap.has(factory.id)) {
        factoriesToUpdate.push(factory)
      } else {
        factoriesToAdd.push(factory)
      }
    })

    const features = factoriesToAdd.map(createFactoryFeature)
    interface FeatureFactoryStatusMap {
      [key: string]: Feature[]
    }
    const featuresByFactoryStatus = {} as FeatureFactoryStatusMap
    features.forEach((feature) => {
      if (!featuresByFactoryStatus[feature.get('factoryStatus')]) {
        featuresByFactoryStatus[feature.get('factoryStatus')] = []
      }
      featuresByFactoryStatus[feature.get('factoryStatus')].push(feature)
    })
    Object.entries(featuresByFactoryStatus).forEach(([factoryStatus, features]) => {
      this.getFactoriesLayerForStatus(factoryStatus as FactoryDisplayStatusType).addFeatures(features)
    })

    // ? Disable updating factory style when fetching new factories, user now should refresh the page manually to get factory status updated
    // factoriesToUpdate.forEach((factory) => this.updateFactory(factory.id, factory))
  }

  public hideFactories (factories: FactoryData[]) {
    factories.forEach(factory => {
      const feature = this.getFactoriesLayerForStatus(getFactoryStatus(factory)).getFeatureById(factory.id)
      feature.setStyle(nullStyle)
    })
  }

  public setFactoryStatusFilter (filters: FactoryDisplayStatusType[]) {
    this.appliedFilters = filters

    this.updateFactoriesFeatureStyle()
  }

  private isFactoryVisible (factory: FactoryData) {
    return this.appliedFilters.includes(getFactoryStatus(factory))
  }

  private getFactoryStyle (factory: FactoryData): Style {
    const visible = this.isFactoryVisible(factory)
    return visible ? iconStyleMap[getFactoryStatus(factory)] : nullStyle
  }

  private createFactoryFeature (factory: FactoryData) {
    const feature = new Feature({
      geometry: new Point(transform([factory.lng, factory.lat], 'EPSG:4326', 'EPSG:3857'))
    })
    feature.setId(factory.id)
    feature.set('factoryId', factory.id)
    feature.set('factoryStatus', getFactoryStatus(factory))
    const style = this.getFactoryStyle(factory)
    featureStyleCache.set(factory.id, style.clone())
    feature.setStyle(style)

    this.factoryMap.set(factory.id, factory)

    return feature
  }

  private forEachFeatureFactory (fn: (feature: Feature, factory: FactoryData) => void) {
    Object.entries(this._factoriesLayerStatusMap).forEach(([, layerSource]) => {
      layerSource.getFeatures().forEach(feature => {
        const id = feature.getId() as string
        const factory = this.factoryMap.get(id) as FactoryData

        fn(feature, factory)
      })
    })
  }

  private displayAllFactory () {
    this.forEachFeatureFactory((feature, factory) => {
      feature.setStyle(iconStyleMap[getFactoryStatus(factory)])
    })
  }

  private updateFactoriesFeatureStyle () {
    this.forEachFeatureFactory((feature, factory) => {
      feature.setStyle(this.getFactoryStyle(factory))
    })
  }
}

const getWMTSTileGrid = () => {
  const projection = getProjection('EPSG:3857')
  const projectionExtent = projection.getExtent()
  const resolutions = new Array(21)
  const size = getWidth(projectionExtent) / 256
  const matrixIds = new Array(21)
  for (let z = 0; z < 21; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    resolutions[z] = size / Math.pow(2, z)
    matrixIds[z] = z
  }

  return new WMTSTileGrid({
    origin: getTopLeft(projectionExtent),
    resolutions: resolutions,
    matrixIds: matrixIds
  })
}

const getBaseLayer = (type: BASE_MAP, wmtsTileGrid: WMTSTileGrid) => {
  if (type === BASE_MAP.PROTOMAP) {
    const taiwanExtent = transformExtent([119.90423060095736, 21.83090666506977, 122.2876172488333, 25.33409668479448], 'EPSG:4326', 'EPSG:3857')
    const layer = new VectorTileLayer({
      source: new VectorTileSource({
        attributions: '<a href="https://protomaps.com" target="_blank">Protomaps</a> © <a href="https://www.openstreetmap.org" target="_blank"> OpenStreetMap</a>',
        format: new MVT(),
        url: 'https://staging.disfactory.tw/tiles/{z}/{x}/{y}.pbf',
        maxZoom: 14
      }),
      opacity: 1,
      zIndex: 1,
      renderMode: VectorTileRenderType.VECTOR
    })
    layer.setExtent(taiwanExtent)
    stylefunction(layer, baseStyle, 'protomaps')
    return layer
  } else {
    const source = (() => {
      switch (type) {
        case BASE_MAP.OSM:
          return new OSM({
            crossOrigin: 'Anonymous',
            attributions:
              '<a href="https://osm.tw/" target="_blank">OpenStreetMap 台灣</a>'
          })
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
              '<a href="https://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>'
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
              '<a href="https://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>'
          })
        default:
          return new OSM({
            crossOrigin: 'Anonymous',
            attributions:
              '<a href="https://osm.tw/" target="_blank">OpenStreetMap 台灣</a>'
          })
      }
    })()

    return new TileLayer({
      source,
      opacity: 0.6,
      zIndex: 1
    })
  }
}

const getLUIMapLayer = (wmtsTileGrid: WMTSTileGrid) => {
  return new TileLayer({
    source: new WMTS({
      matrixSet: 'EPSG:3857',
      format: 'image/png',
      url: 'https://wmts.nlsc.gov.tw/wmts/nURBAN2/default/EPSG:3857/{TileMatrix}/{TileRow}/{TileCol}',
      layer: 'LUIMAP',
      requestEncoding: 'REST',
      tileGrid: wmtsTileGrid,
      tileLoadFunction: function (imageTile, src) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const image: HTMLImageElement = (imageTile as any).getImage()
        flipArgriculturalLand(src).then(newSrc => {
          image.src = newSrc
        })
      },
      crossOrigin: 'Anonymous',
      style: 'default',
      wrapX: true,
      attributions:
        '<a href="https://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>'
    }),
    opacity: 0.5,
    zIndex: 2,
    // TS is wrong, for some reason className is a valid property
    // eslint-disable-next-line
    // @ts-ignore
    className: 'lui-layer'
  })
}

type MapEventHandler = {
  onMoved?: (location: [number, number, number, number], canPlaceFactory: boolean) => void,
  onClicked?: (location: [number, number], feature?: Feature) => void,
  onZoomed?: (zoom: number) => void,
  onLUILayerVisibilityChange?: (visible: boolean) => void
}

type OLMapOptions = {
  minimap?: boolean,
  getInitialLocation?: () => [number, number, number] | undefined
}

export class OLMap {
  private _map: OlMap
  private mapDom: HTMLElement
  private geolocation?: Geolocation
  private baseLayer: TileLayer | VectorTileLayer
  private tileGrid: WMTSTileGrid = getWMTSTileGrid()
  private minimapPinFeature?: Feature
  private hasInitialLocation = false

  constructor (target: HTMLElement, handler: MapEventHandler = {}, options: OLMapOptions = {}) {
    this.mapDom = target

    this.baseLayer = getBaseLayer(BASE_MAP.OSM, this.tileGrid)
    this._map = this.instantiateOLMap(this.mapDom, this.baseLayer, options)

    if (!options.minimap) {
      this.geolocation = this.setupGeolocationTracking(this._map)
    }

    this.setupEventListeners(this._map, handler)
  }

  get map () {
    return this._map
  }

  private setupEventListeners (map: OlMap, handler: MapEventHandler) {
    const move = async () => {
      const view = map.getView()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const zoom = view.getZoom()!

      // resolution in meter
      const resolution = view.getResolutionForZoom(zoom)
      const range = Math.ceil(resolution / 2)

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const [lng, lat] = transform(view.getCenter()!, 'EPSG:3857', 'EPSG:4326')

      if (handler.onMoved) {
        const { width, height } = this.mapDom.getBoundingClientRect()
        const canPlace = await this.canPlaceFactory([width / 2, height / 2])
        handler.onMoved([lng, lat, range, zoom], canPlace)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    map.on('change:resolution', move)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    map.on('moveend', move)

    map.on('zoomend', () => {
      const view = map.getView()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const zoom = view.getZoom()!
      if (handler.onZoomed) {
        handler.onZoomed(zoom)
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    map.on('click', async (event) => {
      if (handler.onClicked) {
        const [lng, lat] = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326')
        const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature, {
          layerFilter: (layer) => {
            return layer.getZIndex() !== 5 // TODO: Hack
          }
        })
        handler.onClicked([lng, lat], feature as Feature)
      }
    })

    // snippet taken from https://gis.stackexchange.com/q/310775
    map.on('pointermove', event => {
      if (!event.dragging) {
        map.getTargetElement().style.cursor = map.hasFeatureAtPixel(map.getEventPixel(event.originalEvent)) ? 'pointer' : ''
      }
    })

    const layer = this.getLUIMAPLayer()
    layer.on('change:visible', function () {
      if (handler.onLUILayerVisibilityChange) {
        handler.onLUILayerVisibilityChange(layer.getVisible())
      }
    })
  }

  public setCoordinate (longitude: number, latitude: number, zoom?: number) {
    const view = this.map.getView()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    zoom = zoom || view.getZoom()!
    view.setCenter(transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'))
    view.setZoom(zoom)
  }

  private instantiateOLMap (target: HTMLElement, baseLayer: TileLayer | VectorTileLayer, options: OLMapOptions = {}) {
    const tileGrid = getWMTSTileGrid()

    let view
    let location
    if (options.getInitialLocation && (location = options.getInitialLocation())) {
      const [longitude, latitude, zoom] = location
      view = new View({
        center: transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'),
        zoom
      })
      this.hasInitialLocation = true
    } else {
      view = new View({
        center: transform([120.48504632216294, 24.088258816482295], 'EPSG:4326', 'EPSG:3857'),
        zoom: 14
      })
    }

    const mapControlButtons = makeMapButtons()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mapOptions: MapOptions = {
      target,
      layers: [
        baseLayer,
        getLUIMapLayer(tileGrid)
      ],
      view,
      controls: [
        new Zoom({
          zoomInLabel: mapControlButtons.zoomIn,
          zoomOutLabel: mapControlButtons.zoomOut,
          zoomInTipLabel: '放大',
          zoomOutTipLabel: '縮小'
        }),
        new ScaleLine(),
        new Rotate(),
        new Attribution()
      ],
      interactions: defaultInteractions({
        pinchRotate: false
      }).extend([
        new PinchRotate({
          threshold: 0.4
        })
      ])
    }

    if (options.minimap) {
      mapOptions.controls = []
      mapOptions.interactions = []
    }

    return new OlMap(mapOptions)
  }

  private setupGeolocationTracking (map: OlMap) {
    const view = map.getView()

    const geolocation = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true
      },
      projection: view.getProjection()
    })

    geolocation.setTracking(true)

    const positionLayer = this.setupGeolocationLayer(geolocation)

    map.addLayer(positionLayer)

    return geolocation
  }

  private setupGeolocationLayer (geolocation: Geolocation) {
    const positionFeature = new Feature()
    const getPositionStyles = (heading: number) =>
      (!Number.isNaN(heading)) ? new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          src: '/images/now.svg',
          rotation: heading,
          rotateWithView: true
        })
      }) : new Style({
        image: new Circle({
          fill: new Fill({ color: '#0099ff' }),
          stroke: new Stroke({ color: '#fff', width: 3 }),
          radius: 15
        })
      })

    positionFeature.setStyle(getPositionStyles(NaN))
    geolocation.on('change:position', function () {
      const coordinates = geolocation.getPosition()
      positionFeature.setGeometry(coordinates ? new Point(coordinates) : undefined)
    })

    geolocation.on('change:heading', function () {
      positionFeature.setStyle(getPositionStyles(geolocation.getHeading() ?? NaN))
    })

    const accuracyFeature = new Feature()
    geolocation.on('change:accuracyGeometry', function () {
      accuracyFeature.setGeometry(geolocation.getAccuracyGeometry())
    })

    let run = false || this.hasInitialLocation
    geolocation.on('change', () => {
      if (run) {
        return
      }

      const position = geolocation.getPosition()
      if (position) {
        this.zoomToGeolocation()
        run = true
      }
    })

    const positionLayer = new VectorLayer({
      source: new VectorSource({
        features: [positionFeature, accuracyFeature]
      }),
      zIndex: 5
    })

    return positionLayer
  }

  public zoomToGeolocation () {
    if (!this.geolocation) {
      throw new Error('No location permission')
    }

    const location = this.geolocation.getPosition()
    if (!location) {
      throw new Error('No location permission')
    }

    const view = this._map.getView()
    view.setCenter(location)
    view.setZoom(16)
  }

  public changeBaseMap (type: BASE_MAP) {
    this._map.removeLayer(this.baseLayer)
    this.baseLayer = getBaseLayer(type, this.tileGrid)
    this._map.addLayer(this.baseLayer)
  }

  public async canPlaceFactory (pixel: MapBrowserEvent['pixel']): Promise<boolean> {
    return new Promise(resolve => {
      let resolved = false
      const check = this._map.forEachLayerAtPixel(pixel, function (_, data) {
        const [,,, a] = data

        resolved = true
        resolve(a !== 128)
      }, {
        // TS is wrong, for some reason layer does have .getClassName()
        // eslint-disable-next-line
        // @ts-ignore
        layerFilter: (layer) => layer.getClassName() === 'lui-layer'
      })

      // !Workaround #forEachLayerAtPixel would not correctly run for some browsers
      if (!resolved) {
        if (check === undefined) {
          resolve(true)
        } else {
          resolve(check)
        }
      }
    })
  }

  private getLUIMAPLayer (): Layer {
    let layer
    this._map.getLayers().forEach(_layer => {
      if (_layer.getProperties().source.layer_ === 'LUIMAP') {
        layer = _layer
      }
    })

    if (!layer) {
      throw (new TypeError('LUIMAP Layer not found'))
    }

    return layer as Layer
  }

  public setLUILayerVisible (visible: boolean) {
    const layer = this.getLUIMAPLayer()
    layer.setVisible(visible)
  }

  public getLUILayerVisible () {
    const layer = this.getLUIMAPLayer()
    return layer.getVisible()
  }

  public setMinimapPin (longitude: number, latitude: number) {
    const coordinate = transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857')

    if (!this.minimapPinFeature) {
      const feature = new Feature({
        geometry: new Point(coordinate)
      })
      feature.setStyle(minimapPinStyle)
      this.minimapPinFeature = feature

      const source = new VectorSource({
        features: [
          feature
        ]
      })

      const vectorLayer = new VectorLayer({
        source,
        zIndex: 4
      })

      this.map.addLayer(vectorLayer)
    } else {
      this.minimapPinFeature.setGeometry(new Point(coordinate))
    }

    this._map.getView().setCenter(coordinate)
  }
}

export function initializeMap (target: HTMLElement, handler: MapEventHandler = {}, options: OLMapOptions) {
  const mapInstance = new OLMap(target, handler, options);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).changeBaseMap = mapInstance.changeBaseMap.bind(mapInstance)
  return new MapFactoryController(mapInstance)
}

export function initializeMinimap (target: HTMLElement, center: number[]) {
  const mapInstance = new OLMap(target, {}, { minimap: true })
  mapInstance.map.getView().setCenter(center)
  return new MapFactoryController(mapInstance)
}
