<template>
  <div ref="minimap" />
</template>

<script lang="ts">
import { createComponent, onMounted, ref } from '@vue/composition-api'
import { initializeMinimap } from '../lib/map'
import { FactoryData } from '../types'

export default createComponent({
  props: {
    initialLocation: {
      type: Array,
      default: []
    },
    pinLocation: {
      type: Array,
      default: []
    },
    initialFactories: {
      type: Array,
      default: []
    }
  },
  name: 'Minimap',
  setup (props) {
    const minimap = ref<HTMLElement>(null)

    onMounted(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const minimapController = initializeMinimap(minimap.value!, props.initialLocation as number[])
      minimapController.addFactories(props.initialFactories as FactoryData[])

      minimapController.mapInstance.setMinimapPin(...props.pinLocation as [number, number])
    })

    return {
      minimap
    }
  }
})
</script>
