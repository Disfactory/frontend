# AGENTS.md — Disfactory Frontend

Single-page app for reporting illegal factories on farmland. Talks to the
[Disfactory backend](https://github.com/Disfactory/Disfactory) API.

## Stack

- Vue 3.5 (`<script setup>` + Composition API, TypeScript strict) + Vite 8
- Tailwind CSS 4 + shadcn-vue (Reka UI primitives in `src/components/ui/`)
- Pinia 4 (global state in `src/stores/`), OpenLayers 10 (map), Embla Carousel 8 (pinned `8.6.0`)
- vite-plugin-pwa (manifest + service worker)
- Vitest (unit) + Playwright (e2e, mocked APIs, headless Chromium)

## Commands

Requires Node 26 and pnpm 11 (`packageManager` is pinned; repo `.nvmrc` says 26).

```bash
pnpm install
pnpm dev          # dev server
pnpm build        # type-check + production build
pnpm type-check   # vue-tsc
pnpm lint         # oxlint + eslint (autofix)
pnpm format       # prettier
pnpm test:unit --run
pnpm test:e2e     # Playwright
```

## Conventions

- Preserve the existing design; verify against staging https://dev.disfactory.tw
  (API: https://staging.disfactory.tw/api).
- New UI goes through shadcn primitives in `src/components/ui/`; don't hand-roll
  carousels, dialogs, or sheets.
- Global reactive state lives in Pinia stores, not module singletons.
- Unit tests colocate in `__tests__/`; e2e specs live in `e2e/` with mocked API
  routes (see `e2e/helpers.ts`).
- Keep PRs draft until staging soak + team sign-off; CI and the Netlify preview
  must be green.
