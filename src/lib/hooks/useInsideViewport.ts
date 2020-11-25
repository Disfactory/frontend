import { onUnmounted, Ref, ref, watch } from '@vue/composition-api'

export const useInsideViewport = (scrollContainer: Ref<HTMLElement | null>, div: Ref<HTMLElement | null>, defaultValue = true) => {
  const inside = ref(defaultValue)

  const onScroll = () => {
    if (!div.value) {
      return
    }

    const elem = div.value
    const rect = elem.getBoundingClientRect()

    // taken from https://stackoverflow.com/a/7557433
    inside.value = rect.top >= 0 &&
                   rect.left >= 0 &&
                   rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
                   rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
  }

  watch(scrollContainer, (scrollElem) => {
    if (!scrollElem) {
      return
    }

    scrollElem.addEventListener('scroll', onScroll)
  })

  onUnmounted(() => {
    if (scrollContainer.value) {
      scrollContainer.value.removeEventListener('scroll', onScroll)
    }
  })

  return inside
}

export default useInsideViewport
