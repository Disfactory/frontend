<template>
  <v-dialog v-model="tutorialModalState" v-bind="$attrs" max-width="350">
    <div class="tutorial-modal">
      <div class="back-button" v-if="isAdd || isUpdate" @click="openHome" data-testid="back-button">
        <span />
        <span />
        <span />
      </div>

      <div class="page">
        <div id="tutorial-home" v-show="isHome">
          <h1 class="mt-3 pb-1 mb-4">使用說明</h1>

          <p>
            如果系統無法讀取你的位置，
            請至手機系統設定開啟位置權限。
          </p>

          <div class="outline-button" @click="openAdd">如何新增一筆<br>違章工廠的資料？</div>
          <div class="outline-button" @click="openUpdate">如何在一筆資料裡<br>補充更多資訊？</div>
        </div>

        <div id="tutorial-add-factory" v-show="isAdd">
          <v-carousel v-model="addFactoryCarouselIndex" progress-color='#6E8501' light hide-delimiter-background :height="650" :progress="false">
            <v-card>
              <v-carousel-item v-for="(image, index) in addImages" :key="image">
                <h2>新增違章工廠({{index + 1}}/7)</h2>
                <img :src="image">
              </v-carousel-item>
            </v-card>
          </v-carousel>
        </div>

        <div id="tutorial-update-factory" v-show="isUpdate">
          <v-carousel v-model="updateFactoryCarouselIndex" progress-color='#6E8501' light hide-delimiter-background :height="620" :progress="false">
            <v-card>
              <v-carousel-item v-for="(image, index) in updateImages" :key="image" class="page pa-3">
                <h2>補充工廠資訊({{index + 1}}/4)</h2>
                <img :src="image">
              </v-carousel-item>
            </v-card>
          </v-carousel>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'

export default defineComponent({
  name: 'TutorialModal',
  props: {
    value: {
      required: true,
      type: Boolean
    }
  },
  setup (props, context) {
    const page = ref('home')

    const isHome = computed(() => page.value === 'home')
    const isAdd = computed(() => page.value === 'add')
    const isUpdate = computed(() => page.value === 'update')

    const addFactoryCarouselIndex = ref(0)
    const resetAddFactoryCarousel = () => { addFactoryCarouselIndex.value = 0 }
    const updateFactoryCarouselIndex = ref(0)
    const resetUpdateFactoryCarousel = () => { updateFactoryCarouselIndex.value = 0 }

    const openHome = () => { page.value = 'home' }
    const openAdd = () => {
      page.value = 'add'
    }
    const openUpdate = () => {
      page.value = 'update'
    }

    const addImages = new Array(7).fill(true).map((_, index) => `/images/tutorial/create-${index + 1}.jpg`)
    const updateImages = new Array(4).fill(true).map((_, index) => `/images/tutorial/update-${index + 1}.jpg`)

    const tutorialModalState = computed({
      get: () => props.value,
      set: (value) => context.emit('input', value)
    })

    watch(tutorialModalState, () => {
      if (!tutorialModalState.value) {
        openHome()
      }
    })
    watch(isHome, () => {
      if (isHome.value) {
        resetAddFactoryCarousel()
        resetUpdateFactoryCarousel()
      }
    })

    return {
      tutorialModalState,
      isHome,
      isAdd,
      isUpdate,
      openHome,
      openAdd,
      openUpdate,
      addImages,
      updateImages,
      addFactoryCarouselIndex,
      updateFactoryCarouselIndex
    }
  }
})
</script>

<style lang="scss">
@import '@/styles/page';
@import '@/styles/variables';
@import '@/styles/components/back-button';

.tutorial-modal {
  background-color: white;
  padding: 12px;

  h2 {
    border: none !important;
  }

  .back-button {
    margin-top: 8px;
    margin-bottom: 16px;
  }

  .outline-button {
    border: solid 1px $primary-color;
    padding: 10px 20px;
    color: $primary-color;
    margin-bottom: 15px;
    line-height: 1.5em;
    user-select: none;
    cursor: pointer;

    &:hover, &:active {
      color: white;
      background-color: $primary-color;
    }
  }

  .v-window__next,
  .v-window__prev {
    background-color: rgba(255,255,255,0.9);
  }
}
</style>
