# Design

## Overview

The Disfactory frontend uses [Vue.js 2.x](https://v2.vuejs.org/) as the main framework. It is a single-page application (SPA) that communicates with the [backend](https://github.com/Disfactory/Disfactory) API server.

For the map, we use [OpenLayers](https://openlayers.org/) as the map library. The map is rendered in the [`Map.vue`](./src/components/Map.vue) component, with [`map.ts`](./src/lib/map.ts) as the main logic for the map.

## Libraries

- [Vue.js 2.x](https://v2.vuejs.org/)
  - Vue composition API
- [OpenLayers](https://openlayers.org/)
- [Vuetify 2.x](https://v2.vuetifyjs.com/): Material Design component framework for Vue.js. Most of the UI components are built with Vuetify.

## Directory Structure

- `public/`: Static files
- `src/`: Main source code directory
  - `components/`: Vue components
  - `lib/`: Libraries and utilities
