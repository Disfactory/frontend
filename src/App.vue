<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <header class="flex items-center justify-between border-b px-4 py-3">
      <RouterLink to="/" class="font-semibold tracking-tight">Disfactory</RouterLink>
      <nav class="text-sm text-muted-foreground">
        <RouterLink to="/about" class="transition-colors hover:text-foreground">關於</RouterLink>
      </nav>
    </header>
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>
