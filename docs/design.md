# Design

## Overview

The Disfactory frontend uses [Vue.js 3.5](https://vuejs.org/) as the main framework. It is a single-page application (SPA) that communicates with the [backend](https://github.com/Disfactory/Disfactory) API server.

For the map, we use [OpenLayers 10](https://openlayers.org/) as the map library. The map is rendered in the [`MapView.vue`](../src/components/MapView.vue) component, with [`map.ts`](../src/lib/map.ts) as the main logic for the map.

## Libraries

- [Vue.js 3.5](https://vuejs.org/) with `<script setup>` + Composition API
- [Vite 8](https://vite.dev/): build tool and dev server
- [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn-vue](https://www.shadcn-vue.com/) ([Reka UI](https://reka-ui.com/)): utility-first styling and accessible UI primitives. Most of the UI components are built with these.
- [Pinia 4](https://pinia.vuejs.org/): global state management
- [OpenLayers 10](https://openlayers.org/)
- [Embla Carousel 8](https://www.embla-carousel.com/): swipe carousels (tutorial, safety notice, factory photo lightbox)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/): PWA manifest and service worker

## Testing

- [Vitest](https://vitest.dev/): unit tests (`pnpm test:unit --run`)
- [Playwright](https://playwright.dev/): end-to-end tests with mocked APIs and headless Chromium (`pnpm test:e2e`)

## Directory Structure

- `public/`: Static files
- `e2e/`: Playwright end-to-end tests and mock helpers
- `src/`: Main source code directory
  - `api/`: Backend API client
  - `assets/`: Global CSS and static assets
  - `components/`: Vue components
    - `ui/`: shadcn-vue primitives (button, dialog, carousel, sheet, …)
  - `lib/`: Libraries and utilities
  - `stores/`: Pinia stores
  - `types.ts`: Shared TypeScript types
