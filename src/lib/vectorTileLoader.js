import { Fill, Stroke, Style } from 'ol/style'

// Taken from https://github.com/mapzen/openlayers-mapzen-vector-tile-example/blob/master/js/custom/app.js
export function createOl3Style () {
  const fill = new Fill({ color: '' })
  const stroke = new Stroke({ color: '', width: 1 })
  const polygon = new Style({ fill: fill })
  const line = new Style({ stroke: stroke })

  const styles = []
  return function (feature, resolution) {
    // console.log('=============>>> feature', feature,resolution);
    let length = 0
    const layer = feature.get('layer')
    const kind = feature.get('kind')
    const geom = feature.getGeometry().getType()
    // console.log(layer, kind, geom);

    // water
    if ((layer === 'water' && kind === 'water-layer') ||
        (layer === 'water' && kind === 'river') ||
        (layer === 'water' && kind === 'stream') ||
        (layer === 'water' && kind === 'canal')) {
      stroke.setColor('#9DD9D2')
      stroke.setWidth(1.5)
      styles[length++] = line
    } else if ((layer === 'water' && kind === 'riverbank')) {
      fill.setColor('#9DD9D2')
      stroke.setWidth(1.5)
      styles[length++] = polygon
    } else if ((layer === 'water' && kind === 'water_boundary') ||
        (layer === 'water' && kind === 'ocean_boundary') ||
        (layer === 'water' && kind === 'riverbank_boundary')) {
      stroke.setColor('#93cbc4')
      stroke.setWidth(0.5)
      styles[length++] = line
    } else if (layer === 'water' || layer === 'ocean' ||
        layer === 'lake') {
      fill.setColor('#9DD9D2')
      styles[length++] = polygon
    } else if (layer === 'aeroway' && geom === 'Polygon') {
      fill.setColor('#9DD9D2')
      styles[length++] = polygon
    } else if (layer === 'aeroway' && geom === 'LineString' &&
        resolution <= 76.43702828517625) {
      stroke.setColor('#f0ede9')
      stroke.setWidth(1)
      styles[length++] = line
    } else if ((layer === 'landuse' && kind === 'park') ||
        (layer === 'landuse' && kind === 'national_park') ||
        (layer === 'landuse' && kind === 'nature_reserve') ||
        (layer === 'landuse' && kind === 'wood') ||
        (layer === 'landuse' && kind === 'protected_land')) { // parks
      fill.setColor('#88D18A')
      styles[length++] = polygon
    } else if (layer === 'landuse' && kind === 'hospital') {
      fill.setColor('#fde')
      styles[length++] = polygon
    } else if (layer === 'landuse' && kind === 'school') {
      fill.setColor('#f0e8f8')
      styles[length++] = polygon
    } else if (layer === 'boundaries' && kind === 'country') { // boundaries
      stroke.setColor('#aaaaaa')
      stroke.setWidth(1.5)
      styles[length++] = line
    } else if (layer === 'boundaries' && (kind === 'region' || kind === 'macroregion')) {
      stroke.setColor('#bbbbbb')
      stroke.setWidth(0.5)
      styles[length++] = line
    } else if ((resolution > 3 && layer === 'road' && kind === 'highway')) { // roads
      stroke.setColor('#FA4A48')
      stroke.setWidth(1.5)
      styles[length++] = line
    } else if ((resolution > 3 && layer === 'road' && kind === 'major_road')) {
      stroke.setColor('#fb7b7a')
      stroke.setWidth(1)
      styles[length++] = line
    } else if ((resolution > 3 && layer === 'road' && kind === 'minor_road')) {
      stroke.setColor('#999')
      stroke.setWidth(0.5)
      styles[length++] = line
    } else if ((layer === 'transit' && kind === 'rail')) {
      stroke.setColor('#503D3F')
      stroke.setWidth(0.5)
      styles[length++] = line
    } else if ((resolution < 3 && layer === 'buildings')) { // building
      stroke.setColor('#987284')
      stroke.setWidth(0.15)
      styles[length++] = line
    }

    styles.length = length
    return styles
  }
}
