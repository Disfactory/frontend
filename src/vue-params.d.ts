declare module 'vue-params'

declare module 'vue/types/vue' {
  import Vue, { VueConstructor } from 'vue'

  interface Vue {
    params: any;
  }

  interface VueConstructor {
    params: any;
  }
}
