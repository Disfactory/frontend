export const baseStyle = {
  version: 8,
  name: 'Light',
  sources: {
    protomaps: {
      type: 'vector',
      tiles: [
        'https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.pbf'
      ],
      minzoom: 0,
      maxzoom: 14,
      attribution: '<a href="https://protomaps.com" target="_blank">Protomaps</a> © <a href="https://www.openstreetmap.org" target="_blank"> OpenStreetMap</a>'
    }
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#dddddd'
      }
    },
    {
      id: 'earth',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'earth',
      paint: {
        'fill-color': ' #e7f1ee'
      }
    },
    {
      id: 'landuse_park',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: [
        'any',
        [
          '==',
          'pmap:kind',
          'park'
        ],
        [
          '==',
          'landuse',
          'cemetery'
        ]
      ],
      paint: {
        'fill-color': '#c2f7d1'
      }
    },
    {
      id: 'landuse_hospital',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: [
        'any',
        [
          '==',
          'pmap:kind',
          'hospital'
        ]
      ],
      paint: {
        'fill-color': '#ffeae8'
      }
    },
    {
      id: 'landuse_industrial',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: [
        'any',
        [
          '==',
          'pmap:kind',
          'industrial'
        ]
      ],
      paint: {
        'fill-color': '#f8ffed'
      }
    },
    {
      id: 'landuse_school',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: [
        'any',
        [
          '==',
          'pmap:kind',
          'school'
        ]
      ],
      paint: {
        'fill-color': '#f2fef9'
      }
    },
    {
      id: 'natural_wood',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'natural',
      filter: [
        'any',
        [
          '==',
          'natural',
          'wood'
        ],
        [
          '==',
          'leisure',
          'nature_reserve'
        ],
        [
          '==',
          'landuse',
          'forest'
        ]
      ],
      paint: {
        'fill-color': '#eafbe9'
      }
    },
    {
      id: 'landuse_pedestrian',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: [
        'any',
        [
          '==',
          'highway',
          'footway'
        ]
      ],
      paint: {
        'fill-color': '#eef0f0'
      }
    },
    {
      id: 'natural_scrub',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'natural',
      filter: [
        'in',
        'natural',
        'scrub',
        'grassland'
      ],
      paint: {
        'fill-color': 'rgb(219,239,209)'
      }
    },
    {
      id: 'natural_glacier',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'natural',
      filter: [
        '==',
        'natural',
        'glacier'
      ],
      paint: {
        'fill-color': 'white'
      }
    },
    {
      id: 'natural_sand',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'natural',
      filter: [
        '==',
        'natural',
        'sand'
      ],
      paint: {
        'fill-color': '#eff5e7'
      }
    },
    {
      id: 'landuse_aerodrome',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: [
        '==',
        'aeroway',
        'aerodrome'
      ],
      paint: {
        'fill-color': '#dbe7e7'
      }
    },
    {
      id: 'transit_runway',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'transit',
      filter: [
        'has',
        'aeroway'
      ],
      paint: {
        'line-color': '#d1d9d9',
        'line-width': 6
      }
    },
    {
      id: 'landuse_runway',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: [
        'any',
        [
          '==',
          'aeroway',
          'runway'
        ],
        [
          '==',
          'area:aeroway',
          'runway'
        ],
        [
          '==',
          'area:aeroway',
          'taxiway'
        ]
      ],
      paint: {
        'fill-color': '#d1d9d9'
      }
    },
    {
      id: 'water',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'water',
      paint: {
        'fill-color': '#a4cae1'
      }
    },
    {
      id: 'roads_tunnels_other_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '<',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'other'
        ]
      ],
      paint: {
        'line-color': '#ffffff',
        'line-gap-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          14,
          0,
          14.5,
          0.5,
          20,
          12
        ]
      }
    },
    {
      id: 'roads_tunnels_other',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '<',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'other'
        ]
      ],
      paint: {
        'line-color': '#f7f7f7',
        'line-dasharray': [
          1,
          1
        ],
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          14,
          0,
          14.5,
          0.5,
          20,
          12
        ]
      }
    },
    {
      id: 'roads_tunnels_minor_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '<',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'minor_road'
        ]
      ],
      paint: {
        'line-color': '#e2e2e2',
        'line-dasharray': [
          3,
          2
        ],
        'line-gap-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          12,
          0,
          12.5,
          0.5,
          20,
          32
        ],
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          12,
          0,
          12.5,
          1
        ]
      }
    },
    {
      id: 'roads_tunnels_minor',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '<',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'minor_road'
        ]
      ],
      paint: {
        'line-color': '#ebebeb',
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          12,
          0,
          12.5,
          0.5,
          20,
          32
        ]
      }
    },
    {
      id: 'roads_tunnels_medium_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '<',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'medium_road'
        ]
      ],
      paint: {
        'line-color': '#e1e1e1',
        'line-dasharray': [
          3,
          2
        ],
        'line-gap-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          7,
          0,
          7.5,
          0.5,
          20,
          32
        ],
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          10,
          0,
          10.5,
          1
        ]
      }
    },
    {
      id: 'roads_tunnels_medium',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '<',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'medium_road'
        ]
      ],
      paint: {
        'line-color': '#ebebeb',
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          7,
          0,
          7.5,
          0.5,
          20,
          32
        ]
      }
    },
    {
      id: 'roads_tunnels_major_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '<',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'major_road'
        ]
      ],
      paint: {
        'line-color': '#e3cfd3',
        'line-dasharray': [
          3,
          2
        ],
        'line-gap-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          7,
          0,
          7.5,
          0.5,
          19,
          32
        ],
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          9,
          0,
          9.5,
          1
        ]
      }
    },
    {
      id: 'roads_tunnels_major',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '<',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'major_road'
        ]
      ],
      paint: {
        'line-color': '#ebebeb',
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          7,
          0,
          7.5,
          0.5,
          19,
          32
        ]
      }
    },
    {
      id: 'roads_tunnels_highway_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '<',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'highway'
        ]
      ],
      paint: {
        'line-color': '#ebcea2',
        'line-dasharray': [
          3,
          2
        ],
        'line-gap-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          3,
          0,
          3.5,
          0.5,
          18,
          32
        ],
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          7,
          0,
          7.5,
          1
        ]
      }
    },
    {
      id: 'roads_tunnels_highway',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '<',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'highway'
        ]
      ],
      paint: {
        'line-color': '#ebebeb',
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          3,
          0,
          3.5,
          0.5,
          18,
          32
        ]
      }
    },
    {
      id: 'physical_line_waterway',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'physical_line',
      filter: [
        '==',
        [
          'get',
          'pmap:kind'
        ],
        'waterway'
      ],
      paint: {
        'line-color': '#a4cae1',
        'line-width': 0.5
      }
    },
    {
      id: 'buildings',
      type: 'fill-extrusion',
      source: 'protomaps',
      'source-layer': 'buildings',
      paint: {
        'fill-extrusion-color': '#cbcece',
        'fill-extrusion-height': [
          'to-number',
          [
            'get',
            'height'
          ]
        ],
        'fill-extrusion-opacity': 0.5
      }
    },
    {
      id: 'roads_other',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '==',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'other'
        ]
      ],
      paint: {
        'line-color': '#ffffff',
        'line-dasharray': [
          2,
          1
        ],
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          14,
          0,
          14.5,
          0.5,
          20,
          12
        ]
      }
    },
    {
      id: 'roads_minor_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '==',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'minor_road'
        ]
      ],
      paint: {
        'line-color': '#e2e2e2',
        'line-gap-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          12,
          0,
          12.5,
          0.5,
          20,
          32
        ],
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          12,
          0,
          12.5,
          1
        ]
      }
    },
    {
      id: 'roads_minor',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '==',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'minor_road'
        ]
      ],
      paint: {
        'line-color': 'white',
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          12,
          0,
          12.5,
          0.5,
          20,
          32
        ]
      }
    },
    {
      id: 'roads_medium_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '==',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'medium_road'
        ]
      ],
      paint: {
        'line-color': '#e1e1e1',
        'line-gap-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          7,
          0,
          7.5,
          0.5,
          20,
          32
        ],
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          10,
          0,
          10.5,
          1
        ]
      }
    },
    {
      id: 'roads_medium',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '==',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'medium_road'
        ]
      ],
      paint: {
        'line-color': '#ffffff',
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          7,
          0,
          7.5,
          0.5,
          20,
          32
        ]
      }
    },
    {
      id: 'roads_major_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '==',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'major_road'
        ]
      ],
      paint: {
        'line-color': '#e3cfd3',
        'line-gap-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          7,
          0,
          7.5,
          0.5,
          19,
          32
        ],
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          9,
          0,
          9.5,
          1
        ]
      }
    },
    {
      id: 'roads_major',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '==',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'major_road'
        ]
      ],
      paint: {
        'line-color': '#ffffff',
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          7,
          0,
          7.5,
          0.5,
          19,
          32
        ]
      }
    },
    {
      id: 'roads_highway_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '==',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'highway'
        ]
      ],
      paint: {
        'line-color': '#ebcea2',
        'line-gap-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          3,
          0,
          3.5,
          0.5,
          18,
          32
        ],
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          7,
          0,
          7.5,
          1
        ]
      }
    },
    {
      id: 'roads_highway',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '==',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'highway'
        ]
      ],
      paint: {
        'line-color': '#fefffc',
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          3,
          0,
          3.5,
          0.5,
          18,
          32
        ]
      }
    },
    {
      id: 'transit_railway',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'transit',
      filter: [
        'all',
        [
          '==',
          'pmap:kind',
          'railway'
        ]
      ],
      paint: {
        'line-color': '#b3bcc9',
        'line-width': 2
      }
    },
    {
      id: 'transit_railway_tracks',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'transit',
      filter: [
        'all',
        [
          '==',
          'pmap:kind',
          'railway'
        ]
      ],
      paint: {
        'line-color': '#ffffff',
        'line-width': 0.8,
        'line-dasharray': [
          6,
          10
        ]
      }
    },
    {
      id: 'boundaries',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'boundaries',
      paint: {
        'line-color': '#5c4a6b',
        'line-width': 0.5,
        'line-dasharray': [
          3,
          2
        ]
      }
    },
    {
      id: 'physical_line_waterway_label',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'physical_line',
      minzoom: 14,
      layout: {
        'symbol-placement': 'line',
        'text-font': [
          'Microsoft JhengHei',
          'STHeitiTC-Medium'
        ],
        'text-field': [
          'get',
          'name'
        ],
        'text-size': 14,
        'text-letter-spacing': 0.3
      },
      paint: {
        'text-color': 'white',
        'text-halo-color': '#a4cae1',
        'text-halo-width': 2
      }
    },
    {
      id: 'roads_bridges_other_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '>',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'other'
        ]
      ],
      paint: {
        'line-color': '#ffffff',
        'line-gap-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          14,
          0,
          14.5,
          0.5,
          20,
          12
        ]
      }
    },
    {
      id: 'roads_bridges_other',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '>',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'other'
        ]
      ],
      paint: {
        'line-color': '#ffffff',
        'line-dasharray': [
          2,
          1
        ],
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          14,
          0,
          14.5,
          0.5,
          20,
          12
        ]
      }
    },
    {
      id: 'roads_bridges_minor_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '>',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'minor_road'
        ]
      ],
      paint: {
        'line-color': '#e2e2e2',
        'line-gap-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          12,
          0,
          12.5,
          0.5,
          20,
          32
        ],
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          12,
          0,
          12.5,
          1
        ]
      }
    },
    {
      id: 'roads_bridges_minor',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '>',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'minor_road'
        ]
      ],
      paint: {
        'line-color': 'white',
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          12,
          0,
          12.5,
          0.5,
          20,
          32
        ]
      }
    },
    {
      id: 'roads_bridges_medium_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '>',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'medium_road'
        ]
      ],
      paint: {
        'line-color': '#e1e1e1',
        'line-gap-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          7,
          0,
          7.5,
          0.5,
          20,
          32
        ],
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          10,
          0,
          10.5,
          1
        ]
      }
    },
    {
      id: 'roads_bridges_medium',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '>',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'medium_road'
        ]
      ],
      paint: {
        'line-color': '#ffffff',
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          7,
          0,
          7.5,
          0.5,
          20,
          32
        ]
      }
    },
    {
      id: 'roads_bridges_major_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '>',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'major_road'
        ]
      ],
      paint: {
        'line-color': '#e3cfd3',
        'line-gap-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          7,
          0,
          7.5,
          0.5,
          19,
          32
        ],
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          9,
          0,
          9.5,
          1
        ]
      }
    },
    {
      id: 'roads_bridges_major',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '>',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'major_road'
        ]
      ],
      paint: {
        'line-color': '#ffffff',
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          7,
          0,
          7.5,
          0.5,
          19,
          32
        ]
      }
    },
    {
      id: 'roads_bridges_highway_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '>',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'highway'
        ]
      ],
      paint: {
        'line-color': '#ebcea2',
        'line-gap-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          3,
          0,
          3.5,
          0.5,
          18,
          32
        ],
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          7,
          0,
          7.5,
          1
        ]
      }
    },
    {
      id: 'roads_bridges_highway',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        [
          '>',
          'pmap:level',
          0
        ],
        [
          '==',
          'pmap:kind',
          'highway'
        ]
      ],
      paint: {
        'line-color': '#fefffc',
        'line-width': [
          'interpolate',
          [
            'exponential',
            1.6
          ],
          [
            'zoom'
          ],
          3,
          0,
          3.5,
          0.5,
          18,
          32
        ]
      }
    },
    {
      id: 'roads_labels',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 13,
      layout: {
        'symbol-placement': 'line',
        'text-font': [
          'Microsoft JhengHei',
          'STHeitiTC-Medium'
        ],
        'text-field': [
          'get',
          'name'
        ],
        'text-size': 14
      },
      paint: {
        'text-color': '#91888b',
        'text-halo-color': 'white',
        'text-halo-width': 2
      }
    },
    {
      id: 'mask',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'mask',
      paint: {
        'fill-color': '#dddddd'
      }
    },
    {
      id: 'physical_point_ocean',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'physical_point',
      filter: [
        'any',
        [
          '==',
          'place',
          'sea'
        ],
        [
          '==',
          'place',
          'ocean'
        ]
      ],
      layout: {
        'text-font': [
          'Microsoft JhengHei',
          'STHeitiTC-Medium'
        ],
        'text-field': [
          'get',
          'name'
        ],
        'text-size': 14,
        'text-letter-spacing': 0.15
      },
      paint: {
        'text-color': 'white',
        'text-halo-color': '#a4cae1',
        'text-halo-width': 1
      }
    },
    {
      id: 'physical_point_peak',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'physical_point',
      filter: [
        'any',
        [
          '==',
          'natural',
          'peak'
        ]
      ],
      layout: {
        'text-font': [
          'Microsoft JhengHei',
          'STHeitiTC-Medium'
        ],
        'text-field': [
          'get',
          'name'
        ],
        'text-size': 14
      },
      paint: {
        'text-color': '#61bb5b',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5
      }
    },
    {
      id: 'places_subplace',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'places',
      filter: [
        '==',
        'pmap:kind',
        'neighbourhood'
      ],
      minzoom: 10,
      layout: {
        'text-field': '{name}',
        'text-font': [
          'Microsoft JhengHei',
          'STHeitiTC-Medium'
        ],
        'text-size': {
          base: 1.2,
          stops: [
            [
              11,
              13
            ],
            [
              14,
              15
            ]
          ]
        },
        'text-transform': 'uppercase'
      },
      paint: {
        'text-color': '#757d91',
        'text-halo-color': 'white',
        'text-halo-width': 1
      }
    },
    {
      id: 'places_city_circle',
      type: 'circle',
      source: 'protomaps',
      'source-layer': 'places',
      filter: [
        '==',
        'pmap:kind',
        'city'
      ],
      paint: {
        'circle-radius': 2,
        'circle-stroke-width': 2,
        'circle-stroke-color': 'white',
        'circle-color': '#666666'
      },
      maxzoom: 8
    },
    {
      id: 'places_city',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'places',
      filter: [
        '==',
        'pmap:kind',
        'city'
      ],
      layout: {
        'text-field': '{name}',
        'text-font': [
          'Microsoft JhengHei',
          'STHeitiTC-Medium'
        ],
        'text-size': [
          'step',
          [
            'get',
            'pmap:rank'
          ],
          0,
          1,
          18,
          2,
          16
        ],
        'text-variable-anchor': [
          'bottom-left'
        ],
        'text-radial-offset': 0.2
      },
      paint: {
        'text-color': '#787878',
        'text-halo-color': 'white',
        'text-halo-width': 1
      }
    },
    {
      id: 'places_state',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'places',
      filter: [
        '==',
        'pmap:kind',
        'state'
      ],
      layout: {
        'text-field': '{name}',
        'text-font': [
          'Microsoft JhengHei',
          'STHeitiTC-Medium'
        ],
        'text-size': 12,
        'text-radial-offset': 0.2,
        'text-anchor': 'center',
        'text-transform': 'uppercase'
      },
      paint: {
        'text-color': '#bdbdbd',
        'text-halo-color': 'white',
        'text-halo-width': 0.5
      }
    },
    {
      id: 'places_country',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'places',
      filter: [
        '==',
        'place',
        'country'
      ],
      layout: {
        'text-field': '{name}',
        'text-font': [
          'Microsoft JhengHei',
          'STHeitiTC-Medium'
        ],
        'text-size': {
          base: 1.2,
          stops: [
            [
              2,
              14
            ],
            [
              6,
              14
            ],
            [
              8,
              20
            ]
          ]
        },
        'text-transform': 'uppercase'
      },
      paint: {
        'text-color': '#9590aa',
        'text-halo-color': 'white',
        'text-halo-width': 1.0
      }
    }
  ]
}
