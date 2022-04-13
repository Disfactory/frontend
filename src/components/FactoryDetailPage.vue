<template>
  <div>
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

            <v-btn @click="copyToClipboard" rounded v-if="$vuetify.breakpoint.mdAndUp" :outlined="showCopiedMessage" :color="showCopiedMessage ? null : 'white'">
              <v-icon class="mr-1">mdi-share-variant</v-icon>
              {{ showCopiedMessage ? '已複製連結' : '分享工廠' }}
            </v-btn>

            <span v-else>
              <v-icon class="mr-4" @click="copyToClipboard">mdi-share-variant</v-icon>
              <v-icon @click="collapseFactoryDetail">mdi-close</v-icon>
            </span>
          </div>

          <p class="factory-status secondary--text mb-2" style="clear: both">
            <v-icon style="margin-bottom: 5px;" :color="statusColor">mdi-map-marker</v-icon>{{ factoryStatusText }}
          </p>

          <p class="caption mb-0" style="color: #A1A1A1;">
            工廠編號 {{ factoryId }} <br>
            {{ lastUpdatedAt }}
          </p>

          <div class="copied-message flex justify-center align-items-center" v-if="showCopiedMessage && !scrollOff">
            <v-icon color="white" class="mr-1">mdi-content-copy</v-icon>
            已複製連結
          </div>
        </v-card-text>

        <v-slide-group :show-arrows="images > 0 ? 'desktop' : false" ref="slideGroup">
          <v-slide-item>
            <div class='update-image-button d-flex flex-column justify-center align-items-center' @click="pageTransition.startUpdateFactoryImages">
              <v-icon color="white" class='mb-1'>mdi-camera-plus</v-icon>
              補充照片
            </div>
          </v-slide-item>
          <v-slide-item v-for="(image, index) in images" class="mr-4" :key="image.id" :class="{ 'ml-4': index === 0 }" @click.native="setLightboxIndex(index)">
            <img :src="image.url" class="factory-slide-image" />
          </v-slide-item>
        </v-slide-group>

        <div class="mt-4 mx-3 mb-2">
          <h3 class="mb-1">地段 / 地址</h3>
          <p class="mb-5">{{ factoryAddressAndLandcode }}</p>

          <div v-if="full || $vuetify.breakpoint.mdAndUp" class="mb-5">
            <h3 class="mb-1">經緯度</h3>
            <p class="mb-1">{{ longitude }}, {{ latitude }}</p>
            <p class="text-caption">以上經緯度版本為 WGS84</p>
          </div>

          <template v-if="source">
            <h3 class="mb-1">資料來源</h3>
            <p class="mb-5">{{ source }}</p>
          </template>

          <hr v-if="full || $vuetify.breakpoint.mdAndUp">
          <v-btn text depressed elevation="0" :ripple="false" color="#697F01" class="m-0 mb-0 px-0 v-btn-plain" @click="expandFactoryDetail" v-if="!full && !$vuetify.breakpoint.mdAndUp">
            顯示更多資訊
            &nbsp;
            <v-icon>mdi-menu-down</v-icon>
          </v-btn>

          <div v-if="full || $vuetify.breakpoint.mdAndUp" class="mt-4">
            <h2 class="mb-5">其他工廠資訊</h2>

            <h3 class="mb-1">工廠外部文字</h3>
            <p class="mb-3" v-if="factoryName">{{ factoryName }}</p>
            <v-btn class="d-block mb-5" outlined @click="startUpdateFactoryCommentFor('name')">
              {{ factoryName ? '更改外部文字' : '回報外部文字' }}
            </v-btn>

            <h3 class="mb-1">工廠類型</h3>
            <p class="mb-3" v-if="factoryType">{{ factoryType }}</p>
            <v-btn class="d-block mb-5" outlined @click="startUpdateFactoryCommentFor('factory_type')">
              {{ factoryType ? '更改工廠類型' : '回報工廠類型' }}
            </v-btn>

            <h3 class="mb-1">工廠描述</h3>
            <v-btn outlined @click="startUpdateFactoryCommentFor('others')" class="mb-2">補充工廠描述</v-btn>

            <div v-for="(desc, index) in pastDescriptions" :key="index" class="mt-2" style="font-size: 14px">
              <p class="color-gray-light mb-1">{{ desc.date }}</p>
              <p style="line-height: 24px;">{{ desc.others }}</p>
            </div>

            <p v-for="(text, index) in factoryFollowupText" class="mt-2" :key="index">
              {{ text }}
            </p>
          </div>
        </div>
      </div>

      <div class="factory-detail-scroller px-4 py-5" v-show="!appState.factoryData">
        <h1 class="secondary--text mb-5">請選擇一個地標</h1>
        <p>請選擇一間工廠查看工廠詳細資訊。</p>
      </div>

      <div class="sidebar-collapse-button d-flex align-items-center justify-center" v-show="$vuetify.breakpoint.mdAndUp" @click="toggleFactoryDetail">
        <v-icon color="primary">mdi-menu-left</v-icon>
      </div>
    </v-card>

    <CoolLightBox
      :items="lightboxItems"
      :index="lightboxIndex"
      @close="() => setLightboxIndex(null)">
    </CoolLightBox>
  </div>
</template>

<script lang="ts">
import { createComponent, computed, ref, onUpdated, watch } from '@vue/composition-api'
import copy from 'copy-to-clipboard'
import { getFactoryStatus, getStatusBorderColor } from '@/lib/map'
import { getFactoryTypeText } from '@/lib/factory'
import useScroll from '@/lib/hooks/useScroll'
import { getFactoryReportRecords } from '@/api'

import { useAppState } from '../lib/appState'
import { FactoryImage, getDisplayStatusText, ReportRecord } from '../types'

export default createComponent({
  name: 'FactoryDetailPage',
  setup () {
    const [appState, { pageTransition, expandFactoryDetail, collapseFactoryDetail, toggleFactoryDetail }] = useAppState()

    const images = computed(() => {
      if (appState.factoryData) {
        return appState.factoryData.images
      } else {
        return []
      }
    })

    const lightboxItems = computed(() => {
      if (appState.factoryData) {
        return appState.factoryData.images.map(image => ({
          title: '',
          description: '',
          src: image.url
        }))
      } else {
        return []
      }
    })
    const lightboxIndex = ref<number|null>(null)
    const setLightboxIndex = (i: number) => {
      lightboxIndex.value = i
    }

    const factoryStatus = computed(() => {
      if (appState.factoryData) {
        return getFactoryStatus(appState.factoryData)
      } else {
        return undefined
      }
    })

    const factoryFollowupText = computed(() => {
      if (appState.factoryData) {
        return appState.factoryData.follow_ups_for_user
      } else {
        return ''
      }
    })

    const factoryStatusText = computed(() => {
      if (typeof factoryStatus.value !== 'undefined') {
        const factoryDisplayStatus = getDisplayStatusText(factoryStatus.value)
        const { document_display_status: documentDisplayStatus } = appState.factoryData || {}
        if (documentDisplayStatus) {
          return `${factoryDisplayStatus}：${documentDisplayStatus}`
        }
        return factoryDisplayStatus
      } else {
        return ''
      }
    })

    const statusColor = computed(() => {
      if (typeof factoryStatus.value !== 'undefined') {
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
      } else {
        return null
      }
    })

    const factoryName = computed(() => {
      return appState.factoryData?.name || ''
    })

    const factoryAddressAndLandcode = computed(() => {
      if (appState.factoryData) {
        const { townname, sectname, sectcode, landcode } = appState.factoryData
        // 白鷺段（1005）817地號
        return `${townname} ${sectname} (${sectcode}) ${landcode}地號`
      } else {
        return ''
      }
    })

    const source = computed(() => {
      if (appState.factoryData) {
        return appState.factoryData.source?.split('')
          .map(function getName (source) {
            switch (source) {
              case 'U':
                return '本系統'
              case 'G':
                return '農委會'
              case 'E':
                return '經濟部'
            }
          })
          .join('、')
      }

      return ''
    })

    const full = computed(() => appState.factoryDetailsExpanded)

    const longitude = computed(() => appState.factoryData?.lng.toFixed(7))
    const latitude = computed(() => appState.factoryData?.lat.toFixed(7))

    const factoryDetailScrollerRef = ref(null)
    const { scrollTop } = useScroll(factoryDetailScrollerRef)
    const scrollOff = computed(() => scrollTop.value > 29 && full.value)

    const showCopiedMessage = ref(false)
    const copyToClipboard = () => {
      if (!appState.factoryData) {
        return
      }

      const { host, protocol } = window.location
      const url = `${protocol}//${host}/#map=16/${appState.factoryData?.lng}/${appState.factoryData?.lat}&factoryId=${appState.factoryData.id}`

      copy(url)

      showCopiedMessage.value = true
      window.setTimeout(() => {
        showCopiedMessage.value = false
      }, 1000)
    }

    // Workaround https://github.com/vuetifyjs/vuetify/issues/10971
    const slideGroup = ref(null)
    let prevImages: FactoryImage[]
    onUpdated(() => {
      if (JSON.stringify(images.value) === JSON.stringify(prevImages)) {
        return
      } else {
        if (!prevImages) {
          prevImages = images.value.slice()
          return
        } else {
          prevImages = images.value.slice()
        }
      }

      if (!slideGroup.value) {
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content = (slideGroup.value as any)?.$refs.content
      window.setTimeout(() => {
        content.style = 'translateX(0px)'
      }, 50)
    })

    const startUpdateFactoryCommentFor = (field = 'others') => {
      pageTransition.startUpdateFactoryComment(field)
    }

    const reportRecords = ref<ReportRecord[]>([])
    watch(() => appState.factoryData, function () {
      if (appState.factoryData) {
        (async () => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          reportRecords.value = ((await getFactoryReportRecords(appState.factoryData?.id!)) || []).sort((a, b) => {
            return new Date(b.created_at) >= new Date(a.created_at) ? 1 : -1
          })
        })()
      }
    })
    const pastDescriptions = computed(() => {
      return reportRecords.value.map(record => {
        const date = new Date(record.created_at)
        const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
        return {
          date: dateStr,
          others: record.others
        }
      }).filter(rec => rec.others)
    })
    const lastUpdatedAt = computed(() => {
      if (!appState.factoryData || !appState.factoryData.reported_at) {
        return null
      }

      let date
      if (reportRecords.value.length === 0) {
        date = new Date(appState.factoryData.reported_at)
      } else {
        date = new Date(reportRecords.value[0].created_at)
      }
      const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`

      return `最後更新 ${dateStr}`
    })

    return {
      full,
      appState,
      pageTransition,
      images,
      expandFactoryDetail,
      collapseFactoryDetail,
      toggleFactoryDetail,
      factoryStatus,
      factoryStatusText,
      statusColor,
      factoryId,
      factoryType,
      factoryName,
      factoryAddressAndLandcode,
      factoryFollowupText,
      source,
      pastDescriptions,
      lastUpdatedAt,
      longitude,
      latitude,
      factoryDetailScrollerRef,
      scrollOff,
      showCopiedMessage,
      copyToClipboard,
      slideGroup,
      startUpdateFactoryCommentFor,
      lightboxItems,
      lightboxIndex,
      setLightboxIndex
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

    + p {
      line-height: 1.3;
    }
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

  &.full .factory-detail-scroller {
    padding-bottom: 60px;
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
    top: 30px;
    left: -30px;
    background-color: white;
    width: 30px;
    height: 74px;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1),  inset -0.7px 0px 2px rgba(0, 0, 0, 0.1);
    // add important to workaround vutify style
    border-radius: 10px 0 0 10px !important;
    cursor: pointer;
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
  cursor: pointer;
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

.v-slide-group__wrapper {
  touch-action: auto !important;
}
</style>
