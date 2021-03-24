/**
 * @module ol/util
 */

/**
 * @return {?} Any return.
 */
export function abstract () {
  return /** @type {?} */ ((function () {
    throw new Error('Unimplemented abstract method.')
  })())
}

/**
 * Counter for getUid.
 * @type {number}
 * @private
 */
let uidCounter_ = 0

/**
 * Gets a unique ID for an object. This mutates the object so that further calls
 * with the same object as a parameter returns the same value. Unique IDs are generated
 * as a strictly increasing sequence. Adapted from goog.getUid.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {string} The unique ID for the object.
 * @api
 */
export function getUid (obj) {
  return obj.ol_uid || (obj.ol_uid = String(++uidCounter_))
}

/**
 * OpenLayers version.
 * @type {string}
 */
export const VERSION = 'latest'
/**
 * @enum {string}
 * @const
 */
export const EventType = {
  /**
   * Generic change event. Triggered when the revision counter is increased.
   * @event module:ol/events/Event~BaseEvent#change
   * @api
   */
  CHANGE: 'change',

  /**
   * Generic error event. Triggered when an error occurs.
   * @event module:ol/events/Event~BaseEvent#error
   * @api
   */
  ERROR: 'error',

  BLUR: 'blur',
  CLEAR: 'clear',
  CONTEXTMENU: 'contextmenu',
  CLICK: 'click',
  DBLCLICK: 'dblclick',
  DRAGENTER: 'dragenter',
  DRAGOVER: 'dragover',
  DROP: 'drop',
  FOCUS: 'focus',
  KEYDOWN: 'keydown',
  KEYPRESS: 'keypress',
  LOAD: 'load',
  RESIZE: 'resize',
  TOUCHMOVE: 'touchmove',
  WHEEL: 'wheel'
}
/**
 * @param {number} number Number to be formatted
 * @param {number} width The desired width
 * @param {number=} opt_precision Precision of the output string (i.e. number of decimal places)
 * @returns {string} Formatted string
 */
export function padNumber (number, width, opt_precision) {
  const numberString =
        opt_precision !== undefined ? number.toFixed(opt_precision) : '' + number
  let decimal = numberString.indexOf('.')
  decimal = decimal === -1 ? numberString.length : decimal
  return decimal > width
    ? numberString
    : new Array(1 + width - decimal).join('0') + numberString
}
/**
 * Returns the modulo of a / b, depending on the sign of b.
 *
 * @param {number} a Dividend.
 * @param {number} b Divisor.
 * @return {number} Modulo.
 */
export function modulo (a, b) {
  const r = a % b
  return r * b < 0 ? r + b : r
}

/**
 * The geometry type. One of `'Point'`, `'LineString'`, `'LinearRing'`,
 * `'Polygon'`, `'MultiPoint'`, `'MultiLineString'`, `'MultiPolygon'`,
 * `'GeometryCollection'`, `'Circle'`.
 * @enum {string}
 */
export const GeometryType = {
  POINT: 'Point',
  LINE_STRING: 'LineString',
  LINEAR_RING: 'LinearRing',
  POLYGON: 'Polygon',
  MULTI_POINT: 'MultiPoint',
  MULTI_LINE_STRING: 'MultiLineString',
  MULTI_POLYGON: 'MultiPolygon',
  GEOMETRY_COLLECTION: 'GeometryCollection',
  CIRCLE: 'Circle'
}
