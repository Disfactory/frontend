<template>
  <v-dialog v-model="safetyModalState" v-bind="$attrs" max-width="350">
    <div class="safety-modal">
      <v-carousel progress-color='#6E8501' light hide-delimiter-background :progress="false">
        <v-card>
          <v-carousel-item class="page pa-3">
            <h1 class="mt-3 pb-1 mb-4">安全須知</h1>
            <p>
              請參考以下建議，前往違章工廠拍照蒐證
            </p>
          </v-carousel-item>
          <v-carousel-item class="page pa-3">
            <img src="/images/safety_notice/1.png" alt="">
            <h2>
              場勘
            </h2>
            <p>
              假裝路過，檢查有無監視器；尋找適合拍照的隱蔽處
            </p>
          </v-carousel-item>
          <v-carousel-item class="page pa-3">
            <img src="/images/safety_notice/2.png" alt="">
            <h2>藏身</h2>
            <p>
              盡量避開監視器、他人視線；盡量在隱蔽處拍照（例如：車上、民宅內、樹叢間、遠方）
            </p>
          </v-carousel-item>
          <v-carousel-item class="page pa-3">
            <img src="/images/safety_notice/3.png" alt="">
            <h2>避嫌</h2>
            <p>假如地點不夠隱密，請用手機拍照，降低他人戒心</p>
          </v-carousel-item>
          <v-carousel-item class="page pa-3">
            <img src="/images/safety_notice/4.png" alt="">
            <h2>速離</h2>
            <p>拍到1張清晰照片即可離去</p>
          </v-carousel-item>
          <v-carousel-item class="page pa-3">
            <img src="/images/safety_notice/5.png" alt="">
            <h2>應變</h2>
            <p>假如有人上前問話，請表現得「充滿好奇心」，試著跟對方聊天（例如：好奇水電師傅的施工技術），再伺機離開。</p>
          </v-carousel-item>
        </v-card>
      </v-carousel>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'SafetyModal',
  props: {
    value: {
      required: true,
      type: Boolean
    }
  },
  setup (props, context) {
    const safetyModalState = computed({
      get: () => props.value,
      set: (value) => context.emit('input', value)
    })

    return {
      safetyModalState
    }
  }
})
</script>

<style lang="scss">
@import '@/styles/page';
@import '@/styles/variables';

.safety-modal {
  .page {
    overflow: hidden;

    img {
      max-height: 45vh;

      display: block;
      margin: 0 auto;
    }

    h2 {
      font-size: 36px;
      color: $primary-color;
      border: none;
      margin-bottom: -5px;
    }
  }
}
</style>
G
