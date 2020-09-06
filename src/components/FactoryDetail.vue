<template>
  <v-card elevation="3" class="factory-container" :class="{ full: appState.factoryDetailsExpanded }" v-if="!!appState.factoryData">
    <v-card-text>
      <div>
        <span class="float-left body-2">工廠狀態</span>
        <v-icon class="float-right" @click="collapseFactoryDetail">mdi-close</v-icon>
        <v-icon class="float-right">mdi-share-variant</v-icon>
      </div>
      <p class="headline text--primary" style="clear: both">
        <v-icon>mdi-map-marker</v-icon>等待被舉報
      </p>
      <p class="caption">
        工廠編號 HK4FD2 <br>
        最後更新 2020/4/12
      </p>
    </v-card-text>
    <v-slide-group>
      <v-slide-item class="mr-4">
        <img src="https://picsum.photos/120/68" alt="">
      </v-slide-item>
      <v-slide-item class="mr-4">
        <img src="https://picsum.photos/120/68" alt="">
      </v-slide-item>
      <v-slide-item class="mr-4">
        <img src="https://picsum.photos/120/68" alt="">
      </v-slide-item>
      <v-slide-item class="mr-4">
        <img src="https://picsum.photos/120/68" alt="">
      </v-slide-item>
    </v-slide-group>
    <div class="mt-4 ml-3">
      <h3 class="text-h5">地段 / 地址</h3>
      <p>台中市大雅區自強段（701）7 地號</p>

      <div v-if="full">
        <h3 class="text-h5">經緯度</h3>
        <p>12.345678, 12.34567890</p>
        <p class="text-caption">以上經緯度版本為 WGS84</p>
      </div>

      <hr v-if="full">
      <p class="text-body-1 ml-3" @click="expandFactoryDetail" v-if="!full">顯示更多資訊</p>

      <div v-if="full" class="mt-4">
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
import { createComponent } from '@vue/composition-api'
import { useAppState } from '../lib/appState'

export default createComponent({
  name: 'FactoryDetail',
  setup () {
    const [appState, { expandFactoryDetail, collapseFactoryDetail }] = useAppState()

    return {
      appState,
      expandFactoryDetail,
      collapseFactoryDetail
    }
  }
})
</script>

<style scoped>
.factory-container {
  height: 50%;
  position: absolute;
  bottom: 0;
  width: 100%;
}

.factory-container.full {
  height: 100%;
}
</style>
