export const useCarouselSwipe = (onNext: () => void, onPrev: () => void) => {
  let startX: number | null = null

  const onPointerDown = (event: PointerEvent) => {
    startX = event.clientX
  }

  const onPointerUp = (event: PointerEvent) => {
    if (startX === null) return
    const delta = event.clientX - startX
    startX = null
    if (Math.abs(delta) < 40) return
    if (delta < 0) onNext()
    else onPrev()
  }

  const onPointerCancel = () => {
    startX = null
  }

  return { onPointerDown, onPointerUp, onPointerCancel }
}
