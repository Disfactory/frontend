 
type PixelMapper = (data: Uint8ClampedArray) => void

const canvas = window.OffscreenCanvas
  ? new OffscreenCanvas(500, 500)
  : document.createElement('canvas')
const ctx = canvas.getContext('2d')! as CanvasRenderingContext2D

export const createImageProcessor =
  (processor: PixelMapper) =>
  (src: string): Promise<string> =>
    new Promise((resolve) => {
      const image = new Image()
      image.crossOrigin = ''
      image.src = src
      image.style.display = 'none'
      image.onload = async () => {
        canvas.width = image.width
        canvas.height = image.height
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(image, 0, 0)

        const imageData = ctx.getImageData(0, 0, image.width, image.height)
        await Promise.resolve(processor(imageData.data))

        const tmpCanvas = document.createElement('canvas')
        const tmpCtx = tmpCanvas.getContext('2d')!
        tmpCanvas.width = image.width
        tmpCanvas.height = image.height
        tmpCtx.putImageData(imageData, 0, 0)

        resolve(tmpCanvas.toDataURL())
        image.remove()
        tmpCanvas.remove()
      }
    })

export const toGrayScale = createImageProcessor((data) => {
  for (let i = 0; i < data.length; i += 4) {
    const avg = ((data[i] ?? 0) + (data[i + 1] ?? 0) + (data[i + 2] ?? 0)) / 3
    data[i] = avg
    data[i + 1] = avg
    data[i + 2] = avg
  }
})

const agriculturalLandColors = [[255, 241, 0]]
const isArrayEqual = (a: number[], b: number[]) => !a.some((v, i) => b[i] !== v)
const isAgriculturalLand = (arr: number[]) =>
  agriculturalLandColors.some((c) => isArrayEqual(c, arr))

export const flipArgriculturalLand = createImageProcessor((data) => {
  for (let i = 0; i < data.length; i += 4) {
    const color = Array.from(data.slice(i, i + 3))
    if (isAgriculturalLand(color)) {
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 1
    } else {
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 255
    }
  }
})
