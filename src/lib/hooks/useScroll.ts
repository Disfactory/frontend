import { onUnmounted, Ref, ref, watch } from 'vue'

export const useScroll = (scrollContainer: Ref<HTMLElement | null>) => {
  const scrollTop = ref(0)
  const scrollLeft = ref(0)

  const onScroll = () => {
    if (!scrollContainer.value) {
      return
    }
    const container = scrollContainer.value

    scrollTop.value = container.scrollTop
    scrollLeft.value = container.scrollLeft
  }

  watch(scrollContainer, (scrollElem) => {
    if (!scrollElem) {
      return
    }

    scrollTop.value = scrollElem.scrollTop
    scrollLeft.value = scrollElem.scrollLeft

    scrollElem.addEventListener('scroll', onScroll)
  })

  onUnmounted(() => {
    if (scrollContainer.value) {
      scrollContainer.value.removeEventListener('scroll', onScroll)
    }
  })

  return {
    scrollTop,
    scrollLeft
  }
}

export default useScroll
