# Disfactory Development Guide

## Pre-requisites

- Node.js 26 (see `.nvmrc`)
- pnpm 11 (`corepack enable` or install from https://pnpm.io)

## Project setup

```bash
cp .env.example .env
pnpm install
```

### Start development server

```bash
pnpm dev
```

## Build for production

```bash
pnpm build
```

## Testing

```bash
# Unit tests (Vitest)
pnpm test:unit --run

# End-to-end tests (Playwright)
pnpm test:e2e
```

## Linting and formatting

```bash
pnpm lint
pnpm format
```

## Stack

- Vue 3.5 with `<script setup>` and TypeScript
- Vite 8 (Rolldown)
- Tailwind CSS 4 + shadcn-vue (Reka UI)
- Pinia 4
- Vue Router 5
- OpenLayers 10
- Vitest 4 + Playwright
