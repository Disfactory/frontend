import exifr from 'exifr'
import { currentBaseURL } from '@/lib/apiConfig'
import type {
  FactoryData,
  FactoriesResponse,
  FactoryImage,
  FactoryPostData,
  ReportRecord,
} from '@/types'

export type UploadedImage = {
  token: string
  src: string
}
export type UploadedImages = UploadedImage[]

type ImageUploadProvider = 'imgur' | 'backend'
const IMAGE_UPLOAD_PROVIDER: ImageUploadProvider =
  (import.meta.env.VITE_IMAGE_UPLOAD_PROVIDER as ImageUploadProvider) || 'backend'
const IMAGE_UPLOAD_URL = import.meta.env.VITE_IMAGE_UPLOAD_URL || ''
const IMGUR_FALLBACK_URL = import.meta.env.VITE_IMGUR_FALLBACK_URL || ''
const IMGUR_CLIENT_ID = '39048813b021935'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${currentBaseURL.value}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}

export async function getFactories(range: number, lng: number, lat: number): Promise<FactoriesResponse> {
  try {
    return await request<FactoriesResponse>(`/factories?range=${range}&lng=${lng}&lat=${lat}`)
  } catch (err) {
    console.error(err)
    throw new TypeError('Get factory failed')
  }
}

export async function getFactory(factoryId: string): Promise<FactoryData> {
  try {
    return await request<FactoryData>(`/factories/${factoryId}`)
  } catch (err) {
    console.error(err)
    throw new TypeError('Get factory failed')
  }
}

type ImageUploadResult = {
  link: string
  deletehash: string
  file: File
}

async function uploadToImgur(file: File): Promise<ImageUploadResult> {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    body: formData,
    headers: { Authorization: `Client-ID ${IMGUR_CLIENT_ID}` },
  })
  if (!response.ok) throw new Error('Imgur upload failed')
  const data = await response.json()

  return { link: data.data.link as string, deletehash: data.data.deletehash as string, file }
}

async function uploadToBackend(file: File): Promise<ImageUploadResult> {
  const formData = new FormData()
  formData.append('image', file)

  const uploadUrl = IMAGE_UPLOAD_URL || `${currentBaseURL.value}/upload`
  const response = await fetch(uploadUrl, { method: 'POST', body: formData })
  if (!response.ok) throw new Error('Image upload failed')
  const data = await response.json()

  if (!data.success) {
    throw new Error(data.data?.error || 'Image upload failed')
  }

  return { link: data.data.link as string, deletehash: data.data.deletehash as string, file }
}

async function uploadImage(file: File): Promise<ImageUploadResult> {
  if (IMAGE_UPLOAD_PROVIDER === 'backend') return uploadToBackend(file)
  return uploadToImgur(file)
}

type AfterExifData = {
  Latitude?: number
  Longitude?: number
  DateTimeOriginal?: string
}

async function readImageExif(file: File): Promise<AfterExifData> {
  try {
    const [gps, exif] = await Promise.all([
      exifr.gps(file),
      exifr.parse(file, ['DateTimeOriginal']),
    ])
    const date = exif?.DateTimeOriginal
    return {
      Latitude: gps?.latitude,
      Longitude: gps?.longitude,
      DateTimeOriginal:
        date instanceof Date ? date.toISOString() : (date as string | undefined),
    }
  } catch (err) {
    console.warn('Unable to read EXIF metadata', err)
    return {}
  }
}

type ImageResponse = { token: string }

async function uploadExifAndGetToken({
  link,
  file,
  deletehash,
}: ImageUploadResult): Promise<UploadedImage> {
  const exifData = await readImageExif(file)
  const data = await request<ImageResponse>('/images', {
    method: 'POST',
    body: JSON.stringify({ url: link, ...exifData, deletehash }),
  })

  return { token: data.token, src: URL.createObjectURL(file) }
}

export async function uploadImages(files: FileList | File[]): Promise<UploadedImages> {
  return Promise.all(Array.from(files).map((file) => uploadImage(file).then(uploadExifAndGetToken)))
}

export async function updateFactoryImages(
  factoryId: string,
  files: FileList | File[],
  { nickname, contact }: { nickname?: string; contact?: string },
) {
  return Promise.all(
    Array.from(files).map((file) =>
      uploadImage(file).then(async (el) => {
        const exifData = await readImageExif(el.file)
        const data = await request<FactoryImage>(`/factories/${factoryId}/images`, {
          method: 'POST',
          body: JSON.stringify({
            url: el.link,
            ...exifData,
            nickname,
            contact,
            deletehash: el.deletehash,
          }),
        })
        data.image_path = el.link
        return data
      }),
    ),
  )
}

export async function createFactory(factory: FactoryPostData): Promise<FactoryData> {
  try {
    return await request<FactoryData>('/factories', {
      method: 'POST',
      body: JSON.stringify(factory),
    })
  } catch (err) {
    console.error(err)
    throw new TypeError('Create factory failed')
  }
}

type UpdatableFactoryFields = {
  name: string
  nickname: string
  contact: string
  others: string
  images: string[]
}

export async function updateFactory(
  factoryId: string,
  factoryData: Partial<UpdatableFactoryFields>,
): Promise<FactoryData> {
  try {
    return await request<FactoryData>(`/factories/${factoryId}`, {
      method: 'PUT',
      body: JSON.stringify(factoryData),
    })
  } catch (err) {
    console.error(err)
    throw new TypeError('Update factory failed')
  }
}

export async function getFactoryReportRecords(factoryId: string): Promise<ReportRecord[]> {
  try {
    return await request<ReportRecord[]>(`/factories/${factoryId}/report_records`)
  } catch (err) {
    console.error(err)
    throw new TypeError('Fetch factory error')
  }
}

export const getImgurFallbackUrl = (src: string) => {
  const match = /i\.imgur\.com\/([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)(\?.*)?$/.exec(src)
  if (!match) return src
  const base = IMGUR_FALLBACK_URL || '/server/imgur'
  return `${base}/${match[1]}.${match[2]}`
}
