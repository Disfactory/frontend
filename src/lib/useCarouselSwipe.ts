import { ref } from 'vue'

export const useCarouselSwipe = (onNext: () => void, onPrev: () => void) => {
  const dragX = ref(0)
  const dragging = ref(false)
  let startX = 0

  const onPointerDown = (event: PointerEvent) => {
    startX = event.clientX
    dragging.value = true
    dragX.value = 0
    ;(event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging.value) return
    dragX.value = event.clientX - startX
  }

  const onPointerUp = (event: PointerEvent) => {
    if (!dragging.value) return
    const delta = event.clientX - startX
    dragging.value = false
    dragX.value = 0
    if (Math.abs(delta) < 40) return
    if (delta < 0) onNext()
    else onPrev()
  }

  const onPointerCancel = () => {
    dragging.value = false
    dragX.value = 0
  }

  return {
    dragX,
    dragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  }
}
