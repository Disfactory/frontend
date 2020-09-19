<template>
  <v-card elevation="3" class="factory-container" :class="{ full, desktop: $vuetify.breakpoint.mdAndUp, empty: !appState.factoryData }" v-show="!appState.formPageOpen">
    <div class="factory-detail-scroller" ref="factoryDetailScrollerRef" v-show="appState.factoryData">
      <v-app-bar fixed color="white" class="d-block d-md-none" v-if="scrollOff">
        <v-spacer></v-spacer>
        <v-toolbar-title>
          <v-icon style="margin-bottom: 5px;" :color="statusColor">mdi-map-marker</v-icon>{{ factoryStatusText }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div class="btn-container">
          <v-icon class="float-right" @click="collapseFactoryDetail">mdi-close</v-icon>
          <v-icon class="float-right mr-4" @click="copyToClipboard">mdi-share-variant</v-icon>
        </div>
        <div class="copied-message flex justify-center align-items-center" v-if="showCopiedMessage">
          <v-icon color="white" class="mr-1">mdi-content-copy</v-icon>
          已複製連結
        </div>
      </v-app-bar>

      <v-card-text>
        <div class="d-flex justify-between align-items-center mb-3">
          <span class="factory-status-title">工廠狀態</span>

          <v-btn @click="copyToClipboard" rounded v-if="$vuetify.breakpoint.mdAndUp" :outlined="showCopiedMessage">
            <v-icon class="mr-1">mdi-share-variant</v-icon>
            {{ showCopiedMessage ? '已複製連結' : '分享工廠' }}
          </v-btn>

          <span v-else>
            <v-icon class="mr-4" @click="copyToClipboard">mdi-share-variant</v-icon>
            <v-icon @click="collapseFactoryDetail">mdi-close</v-icon>
          </span>
        </div>

        <p class="factory-status text--primary mb-2" style="clear: both">
          <v-icon style="margin-bottom: 5px;" :color="statusColor">mdi-map-marker</v-icon>{{ factoryStatusText }}
        </p>

        <p class="caption mb-0">
          工廠編號 {{ factoryId }} <br>
          最後更新 2020/4/12
        </p>

        <div class="copied-message flex justify-center align-items-center" v-if="showCopiedMessage && !scrollOff">
          <v-icon color="white" class="mr-1">mdi-content-copy</v-icon>
          已複製連結
        </div>
      </v-card-text>

      <v-slide-group>
        <v-slide-item v-for="(image, index) in images" class="mr-4" :key="image.id" :class="{ 'ml-4': index === 0 }">
          <img :src="image.url" class="factory-slide-image" />
        </v-slide-item>
        <v-slide-item>
          <div class='update-image-button d-flex flex-column justify-center align-items-center'>
            <v-icon color="white" class='mb-1'>mdi-camera-plus</v-icon>
            補充照片
          </div>
        </v-slide-item>
      </v-slide-group>

      <div class="mt-4 mx-3 mb-2">
        <h3 class="mb-1">地段 / 地址</h3>
        <p class="mb-5">台中市大雅區自強段（701）7 地號</p>

        <div v-if="full || $vuetify.breakpoint.mdAndUp" class="mb-5">
          <h3 class="mb-1">經緯度</h3>
          <p class="mb-1">{{ longitude }}, {{ latitude }}</p>
          <p class="text-caption">以上經緯度版本為 WGS84</p>
        </div>

        <hr v-if="full || $vuetify.breakpoint.mdAndUp">
        <p class="text-body-1 m-0 mb-0" @click="expandFactoryDetail" v-if="!full && !$vuetify.breakpoint.mdAndUp">顯示更多資訊</p>

        <div v-if="full || $vuetify.breakpoint.mdAndUp" class="mt-4">
          <h2 class="mb-5">其他工廠資訊</h2>

          <h3 class="mb-1">工廠外部文字</h3>
          <p class="mb-5">XXX 公司</p>

          <h3 v-if="factoryType" class="mb-1">工廠類型</h3>
          <p class="mb-5" v-if="factoryType">{{ factoryType }}</p>

          <h3 class="mb-1">工廠描述</h3>
          <v-btn outlined>補充工廠描述</v-btn>
        </div>
      </div>
    </div>

    <div class="factory-detail-scroller px-4 py-5" v-show="!appState.factoryData">
      <h1 class="text--primary mb-5">請選擇一個地標</h1>
      <p>請選擇一間工廠查看工廠詳細資訊。</p>
    </div>

    <div class="sidebar-collapse-button d-flex align-items-center justify-center" v-show="$vuetify.breakpoint.mdAndUp" @click="toggleFactoryDetail">
      <v-icon color="#697F01">mdi-menu-left</v-icon>
    </div>
  </v-card>
</template>

<script lang="ts">
import { createComponent, computed, ref } from '@vue/composition-api'
import copy from 'copy-to-clipboard'
import { getFactoryStatus, getStatusBorderColor } from '@/lib/map'
import { getFactoryTypeText } from '@/lib/factory'
import useScroll from '@/lib/hooks/useScroll'

import { useAppState } from '../lib/appState'
import { FactoryStatusText } from '../types'

export default createComponent({
  name: 'FactoryDetailPage',
  setup () {
    const [appState, { expandFactoryDetail, collapseFactoryDetail, toggleFactoryDetail }] = useAppState()

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
        return appState.factoryData.display_number
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

    const factoryDetailScrollerRef = ref(null)
    const { scrollTop } = useScroll(factoryDetailScrollerRef)
    const scrollOff = computed(() => scrollTop.value > 29 && full.value)

    const showCopiedMessage = ref(false)
    const copyToClipboard = () => {
      copy(window.location.href)
      showCopiedMessage.value = true
      window.setTimeout(() => {
        showCopiedMessage.value = false
      }, 1000)
    }

    return {
      full,
      appState,
      images,
      expandFactoryDetail,
      collapseFactoryDetail,
      toggleFactoryDetail,
      factoryStatusText,
      statusColor,
      factoryId,
      factoryType,
      longitude,
      latitude,
      factoryDetailScrollerRef,
      scrollOff,
      showCopiedMessage,
      copyToClipboard
    }
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/variables';

.factory-container {
  position: absolute;
  bottom: 0;
  width: 100%;
  z-index: 5;

  .factory-detail-scroller {
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  .factory-status {
    font-size: 24px;
  }

  h3 {
    color: $light-green-color;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.03em;
  }

  h2 {
    color: $dark-green-color;
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    line-height: 30px;
    letter-spacing: 0.03em;
  }

  .text-caption {
    color: $gray-light-color;
  }

  hr {
    color: #EAF3BF;
    border-color: #EAF3BF;
    background-color: #EAF3BF;
    height: 1px;
    border-width: inherit;
  }

  .btn-container {
    position: absolute;
    right: 10px;
  }

  // mobile expand
  &:not(.desktop) {
    &.full {
      min-height: 100%;
      overflow: auto;
      top: 0;
    }

    &.empty {
      display: none;
    }
  }

  // sidebar style
  &.desktop {
    width: 395px;
    right: -395px;
    top: 64px;
    max-height: calc(100% - 64px);
    border-radius: 0;
    z-index: 4;
    overflow: visible;
    transition: transform ease-in-out 200ms;

    // expanded sidebar
    &.full {
      transform: translateX(-395px);

      .sidebar-collapse-button .v-icon {
        transform: rotate(180deg);
      }
    }

    .copied-message {
      display: none;
    }
  }

  .sidebar-collapse-button {
    position: absolute;
    top: 52px;
    left: -30px;
    background-color: white;
    width: 30px;
    height: 74px;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);
    border-radius: 10px 0 0 10px !important;
    cursor: pointer;

    // add important to workaround vutify style
  }
}

.factory-status-title {
  color: $dark-green-color;
  font-size: 16px;
}

.factory-slide-image {
  width: 120px;
  height: 68px;
  overflow: hidden;
  object-fit: cover;
}

.copied-message {
  background-color: $light-green-color;
  color: white;
  font-size: 14px;
  height: 41px;
  position: absolute;
  width: 100%;
  left: 0;
}

.v-app-bar .copied-message {
  top: 56px;
}

.v-card__text .copied-message {
  top: 48px;
}

.update-image-button {
  background-color: $dark-green-color;
  width: 100px;
  height: 68px;
  color: white;
  font-size: 12px;
  user-select: none;
  cursor: pointer;

  &:first-child {
    margin-left: 15px;
  }
}
</style>
