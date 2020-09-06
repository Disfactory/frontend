<template>
  <v-card elevation="3" class="factory-container d-md-none" :class="{ full: appState.factoryDetailsExpanded }" v-if="!!appState.factoryData">
    <v-card-text>
      <div>
        <span class="float-left body-2">工廠狀態</span>
        <v-icon class="float-right" @click="collapseFactoryDetail">mdi-close</v-icon>
        <v-icon class="float-right">mdi-share-variant</v-icon>
      </div>
      <p class="headline text--primary mb-2" style="clear: both">
        <v-icon style="margin-bottom: 5px;">mdi-map-marker</v-icon>等待被舉報
      </p>
      <p class="caption mb-0">
        工廠編號 HK4FD2 <br>
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
        <p>12.345678, 12.34567890</p>
        <p class="text-caption">以上經緯度版本為 WGS84</p>
      </div>

      <hr v-if="appState.factoryDetailsExpanded">
      <p class="text-body-1 m-0 mb-0" @click="expandFactoryDetail" v-if="!appState.factoryDetailsExpanded">顯示更多資訊</p>

      <div v-if="appState.factoryDetailsExpanded" class="mt-4">
        <h2 class="text-h4 mb-5">其他工廠資訊</h2>
        <h3 class="text-h5">工廠外部文字</h3>
        <p class="mb-2">XXX 公司</p>

        <h3 class="text-h5">工廠類型</h3>
        <p class="mb-2">金屬：車床</p>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { createComponent, computed } from '@vue/composition-api'
import { useAppState } from '../lib/appState'

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

    return {
      appState,
      images,
      expandFactoryDetail,
      collapseFactoryDetail
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
