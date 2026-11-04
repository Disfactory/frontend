/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API base URL, e.g. https://staging.disfactory.tw/api */
  readonly VITE_BASE_URL: string
  /** Optional Imgur relay used for legacy images */
  readonly VITE_IMGUR_FALLBACK_URL?: string
  /** Image upload provider: 'backend' (default) or 'imgur' */
  readonly VITE_IMAGE_UPLOAD_PROVIDER?: 'backend' | 'imgur'
  /** Upload endpoint used when provider is 'backend' */
  readonly VITE_IMAGE_UPLOAD_URL?: string
  /** Protomaps vector tile source */
  readonly VITE_PROTOMAP_SOURCE_URL?: string
  /** Protomaps API key */
  readonly VITE_PROTOMAP_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
