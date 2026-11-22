 
export const FACTORY_TYPE = [
  { value: '2-1', text: '金屬: 沖床、銑床、車床、鏜孔' },
  { value: '2-2', text: '金屬: 焊接、鑄造、熱處理' },
  { value: '2-3', text: '金屬: 金屬表面處理、噴漆' },
  { value: '3', text: '塑膠加工、射出' },
  { value: '4', text: '橡膠加工' },
  { value: '5', text: '非金屬礦物（石材）' },
  { value: '6', text: '食品' },
  { value: '7', text: '皮革' },
  { value: '8', text: '紡織' },
  { value: '9', text: '其他' },
] as const

export type FactoryType = (typeof FACTORY_TYPE)[number]['value']

/**
 * Map/panel status categories (2025 redesign). A factory's category is derived
 * from its latest document status in `getFactoryStatus` (src/lib/timeline.ts).
 */
export type FactoryDisplayStatusType = 'actionable' | 'in_progress' | 'demolished' | 'wont_fix'

export const defaultFactoryDisplayStatuses: FactoryDisplayStatusType[] = [
  'actionable',
  'in_progress',
  'demolished',
  'wont_fix',
]

export type DocumentDisplayStatus =
  | '已檢舉'
  | '已排程稽查'
  | '陳述意見期'
  | '已勒令停工'
  | '已發函斷電'
  | '已排程拆除'
  | '已拆除'
  | '等待新事證'

type FactoryDisplayStatus = {
  type: FactoryDisplayStatusType
  /** Map filter chip label */
  name: string
  /** Detail panel title */
  title: string
  color: string
}

export const FactoryDisplayStatuses: FactoryDisplayStatus[] = [
  { type: 'actionable', name: '尚可連續裁罰', title: '尚可持續檢舉裁罰', color: '#A22A29' },
  { type: 'in_progress', name: '舉報處理中', title: '舉報處理中', color: '#457287' },
  { type: 'demolished', name: '已拆除', title: '已拆除', color: '#697F01' },
  { type: 'wont_fix', name: '現階段無法處理', title: '現階段無法處理', color: '#A1A1A1' },
]

const FactoryDisplayStatusMap = Object.fromEntries(
  FactoryDisplayStatuses.map((status) => [status.type, status]),
) as Record<FactoryDisplayStatusType, FactoryDisplayStatus>

export const getDisplayStatus = (status: FactoryDisplayStatusType) =>
  FactoryDisplayStatusMap[status]

export const getDisplayStatusText = (status: FactoryDisplayStatusType) =>
  FactoryDisplayStatusMap[status].name

export const getDisplayStatusColor = (status: FactoryDisplayStatusType) =>
  FactoryDisplayStatusMap[status].color

export type FactoryImage = {
  id: string
  image_path: string
  url: string
}

export type FactoryData = {
  id: string
  display_number: string
  lat: number
  lng: number
  name: string
  landcode: string
  townname: string
  sectname: string
  sectcode: string
  source: string
  type: FactoryType
  images: FactoryImage[]
  reported_at: null | string
  data_complete: boolean
  before_release: boolean
  document_display_status: DocumentDisplayStatus | null
  feature?: unknown
  follow_ups_for_user: {
    note: string
    created_at: string
  }[]
  wont_fix: boolean
}

export type FactoriesResponse = Array<FactoryData>

export interface FactoriesByStatus {
  [key: string]: FactoryData[]
}

export type FactoryPostData = {
  name: string
  type?: FactoryType
  images?: string[]
  others?: string
  lat: number
  lng: number
  nickname?: string
  contact?: string
}

export type ReportRecord = {
  id: string
  created_at: string
  others?: string
  action_type?: 'POST' | 'UPDATE' | 'POST_IMAGE'
  action_body?: {
    name?: string
    type?: FactoryType
    factory_type?: FactoryType
    url?: string
  }
}

// GET /factories/:id/timeline
export type FactoryTimeline = {
  factory_id: string
  display_number: number
  documents: {
    id: number
    created_at: string
    display_status: string
  }[]
  status_transitions: {
    id: number
    from_status: string
    to_status: string
    created_at: string
    document_id: number
  }[]
  user_reports: ReportRecord[]
  follow_ups_for_user: {
    id: number
    note: string
    created_at: string
  }[]
  image_batches: {
    date: string // YYYY-MM-DD, Asia/Taipei
    count: number
    images: {
      id: string
      image_path: string
      url: string
      created_at: string
    }[]
  }[]
}
