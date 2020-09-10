<template>
  <v-card elevation="3" class="factory-container d-md-none" :class="{ full }" v-if="!!appState.factoryData">
    <v-card-text>
      <div>
        <span class="float-left body-2">工廠狀態</span>
        <v-icon class="float-right" @click="collapseFactoryDetail">mdi-close</v-icon>
        <v-icon class="float-right">mdi-share-variant</v-icon>
      </div>
      <p class="factory-status text--primary mb-2" style="clear: both">
        <v-icon style="margin-bottom: 5px;" :color="statusColor">mdi-map-marker</v-icon>
        {{ factoryStatusText }}
      </p>
      <p class="caption mb-0">
        工廠編號 {{ factoryId }} <br>
        最後更新 2020/4/12
      </p>
    </v-card-text>

    <v-slide-group>
      <v-slide-item v-for="(image, index) in images" class="mr-4" :key="image.id" :class="{ 'ml-4': index === 0 }">
        <img :src="image.url" class="factory-slide-image" />
      </v-slide-item>
    </v-slide-group>

    <div class="mt-4 mx-3 mb-2">
      <h6 class="text-h6">地段 / 地址</h6>
      <p>台中市大雅區自強段（701）7 地號</p>

      <div v-if="full">
        <h3 class="text-h5">經緯度</h3>
        <p>{{ longitude }}, {{ latitude }}</p>
        <p class="text-caption">以上經緯度版本為 WGS84</p>
      </div>

      <hr v-if="full">
      <p class="text-body-1 m-0 mb-0" @click="expandFactoryDetail" v-if="!full">顯示更多資訊</p>

      <div v-if="full" class="mt-4">
        <h2 class="text-h4 mb-5">其他工廠資訊</h2>

        <h3 class="text-h5">工廠外部文字</h3>
        <p class="mb-2">XXX 公司</p>

        <h3 class="text-h5" v-if="factoryType">工廠類型</h3>
        <p class="mb-2" v-if="factoryType">{{ factoryType }}</p>

        <h3 class="text-h5">工廠描述</h3>
        <v-btn outlined>補充工廠描述</v-btn>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { createComponent, computed } from '@vue/composition-api'
import { getFactoryStatus, getStatusBorderColor } from '@/lib/map'
import { getFactoryTypeText } from '@/lib/factory'

import { useAppState } from '../lib/appState'
import { FactoryStatusText } from '../types'

export default createComponent({
  name: 'FactoryDetail',
  setup () {
    const [appState, { expandFactoryDetail, collapseFactoryDetail }] = useAppState()

    const images = computed(() => {
      if (appState.factoryData) {
        return appState.factoryData.images
      } else {
        return []
      }
    })

    const factoryStatus = computed(() => {
      if (appState.factoryData) {
        return getFactoryStatus(appState.factoryData)
      } else {
        return null
      }
    })

    const factoryStatusText = computed(() => {
      if (factoryStatus.value) {
        return FactoryStatusText[factoryStatus.value]?.[0] || ''
      } else {
        return ''
      }
    })

    const statusColor = computed(() => {
      if (factoryStatus.value) {
        return getStatusBorderColor(factoryStatus.value)
      } else {
        return null
      }
    })

    const factoryId = computed(() => {
      if (appState.factoryData) {
        return appState.factoryData.id
      } else {
        return ''
      }
    })

    const factoryType = computed(() => {
      if (appState.factoryData) {
        return getFactoryTypeText(appState.factoryData)
      }
    })

    const full = computed(() => appState.factoryDetailsExpanded)

    const longitude = computed(() => appState.factoryData?.lng.toFixed(7))
    const latitude = computed(() => appState.factoryData?.lat.toFixed(7))

    return {
      full,
      appState,
      images,
      expandFactoryDetail,
      collapseFactoryDetail,
      factoryStatusText,
      statusColor,
      factoryId,
      factoryType,
      longitude,
      latitude
    }
  }
})
</script>

<style scoped lang="scss">
.factory-container {
  position: absolute;
  bottom: 0;
  width: 100%;
  z-index: 5;

  .factory-status {
    font-size: 24px;
  }
}

.factory-container.full {
  height: 100%;
}

.factory-slide-image {
  width: 120px;
  height: 68px;
  overflow: hidden;
  object-fit: cover;
}
</style>
