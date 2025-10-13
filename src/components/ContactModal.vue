<template>
  <v-dialog v-model="contactModalState" v-bind="$attrs" max-width="350">
    <div class="contact-modal">
      <div class="page">
        <img width="137" src="/images/cet-logo.png" alt="Citizen of the Earth Taiwan">

        <h3>
          有任何回報相關問題<br>
          歡迎聯絡
        </h3>

        <p>
          地球公民基金會<br>
          TEL: 02-23920371<br>
          Email: <a href="mailto:cet@cet-taiwan.org">cet@cet-taiwan.org</a><br>
        </p>
      </div>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'ContactModal',
  props: {
    value: {
      required: true,
      type: Boolean
    }
  },
  setup (props, context) {
    const contactModalState = computed({
      get: () => props.value,
      set: (value) => context.emit('input', value)
    })

    return {
      contactModalState
    }
  }
})
</script>

<style lang="scss">
@import '@/styles/page';
@import '@/styles/variables';

.contact-modal {
  background-color: white;
  padding: 12px;
  text-align: center;

  .page h3 {
    color: $primary-color;
    line-height: 1.5em;
  }
}
</style>
