<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { initializeMinimap } from '@/lib/map'
import type { FactoryData } from '@/types'

const props = withDefaults(
  defineProps<{
    initialLocation?: number[]
    pinLocation?: number[]
    initialFactories?: FactoryData[]
  }>(),
  {
    initialLocation: () => [],
    pinLocation: () => [],
    initialFactories: () => [],
  },
)

const minimap = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!minimap.value) return
  const controller = initializeMinimap(minimap.value, props.initialLocation)
  controller.addFactories(props.initialFactories)
  if (props.pinLocation.length === 2) {
    controller.mapInstance.setMinimapPin(
      props.pinLocation[0] as number,
      props.pinLocation[1] as number,
    )
  }
})
</script>

<template>
  <div ref="minimap" class="h-[200px] w-full rounded border border-brand-line" />
</template>
