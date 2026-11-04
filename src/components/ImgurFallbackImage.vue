<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getImgurFallbackUrl } from '@/api'

const props = withDefaults(
  defineProps<{
    src: string
    alt?: string
    class?: string
  }>(),
  {
    alt: '',
    class: '',
  },
)

const imageUrl = ref(props.src)
const fallbackUrl = computed(() => getImgurFallbackUrl(props.src))

watch(
  () => props.src,
  (src) => {
    imageUrl.value = src
  },
)

const onError = () => {
  if (imageUrl.value !== fallbackUrl.value) imageUrl.value = fallbackUrl.value
}
</script>

<template>
  <img :src="imageUrl" :alt="alt" :class="$props.class" @error="onError" />
</template>
