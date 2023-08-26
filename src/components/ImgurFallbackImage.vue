<template>
  <img :src="imageUrl" :alt="alt" :class="className" @error="onError" />
</template>

<script lang="ts">
import { createComponent, computed, ref, onUpdated, watch } from '@vue/composition-api'

const IMGUR_REGEX = /i\.imgur\.com\/([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)(\?.*)?$/

const imgurFallbackBaseUrl = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_IMGUR_FALLBACK_URL : '/server/imgur'

export default createComponent({
  name: 'ImgurFallbackImage',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    className: {
      type: String,
      default: ''
    }
  },
  setup (props, context) {
    const matches = IMGUR_REGEX.exec(props.src)

    const imgurInfo = computed(() => {
      return matches ? {
        id: matches[1],
        ext: matches[2]
      } : null
    })

    const fallbackUrl = computed(() => {
      if (imgurInfo.value) {
        return `${imgurFallbackBaseUrl}/${imgurInfo.value.id}.${imgurInfo.value.ext}`
      } else {
        return props.src
      }
    })

    const imageUrl = ref(props.src)

    const onError = () => {
      imageUrl.value = fallbackUrl.value
    }

    return {
      imageUrl,
      onError
    }
  }
})
</script>
