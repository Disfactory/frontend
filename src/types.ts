import Feature from 'ol/Feature'

/* eslint-disable quote-props */
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
  { value: '9', text: '其他' }
] as const
export type FactoryType = (typeof FACTORY_TYPE)[number]['value']

export type FactoryDisplayStatusType = 'default' | 0 | 1 | 2 | 3

export const defaultFactoryDisplayStatuses = [
  'default', 0, 1, 2, 3
] as FactoryDisplayStatusType[]

type DocumentDisplayStatus = '已檢舉' | '已排程稽查' | '陳述意見期' | '已勒令停工' | '已發函斷電' | '已排程拆除' | '已拆除' | '等待新事證'

type FactoryDisplayStatus = {
  type: FactoryDisplayStatusType,
  name: string,
  documentDisplayStatuses: ('疑似工廠' | DocumentDisplayStatus)[],
  color: string
}
export const FactoryDisplayStatuses: FactoryDisplayStatus[] = [
  {
    type: 'default',
    name: '未處理',
    documentDisplayStatuses: ['疑似工廠'],
    color: '#A22A29'
  },
  {
    type: 0,
    name: '處理中',
    documentDisplayStatuses: ['已檢舉', '已排程稽查', '陳述意見期', '已勒令停工'],
    color: '#457287'
  },
  {
    type: 1,
    name: '已斷電',
    documentDisplayStatuses: ['已發函斷電', '已排程拆除'],
    color: '#364516'
  },
  {
    type: 2,
    name: '已拆除',
    documentDisplayStatuses: ['已拆除'],
    color: '#A1A1A1'
  },
  {
    type: 3,
    name: '無法處理',
    documentDisplayStatuses: ['等待新事證'],
    color: '#E0E0E0'
  }
]

const FactoryDisplayStatusMap = FactoryDisplayStatuses.reduce((acc, c) => {
  return {
    ...acc,
    [c.type]: c
  }
}, {}) as {
  [key in FactoryDisplayStatusType]: FactoryDisplayStatus
}

export const getDisplayStatusText = (status: FactoryDisplayStatusType) => {
  return FactoryDisplayStatusMap[status].name
}

export const getDisplayStatusColor = (status: FactoryDisplayStatusType) => {
  return FactoryDisplayStatusMap[status].color
}

export type FactoryImage = {
  id: string,
  image_path: string,
  url: string
}

export type FactoryData = {
  id: string,
  display_number: string,
  lat: number,
  lng: number,
  name: string,
  landcode: string,
  townname: string,
  sectname: string,
  sectcode: string,
  source: string,
  type: FactoryType,
  images: FactoryImage[],
  // TODO: can be one of https://docs.djangoproject.com/en/2.2/ref/settings/#datetime-input-formats
  // eslint-disable-next-line
  reported_at: null | string,
  data_complete: boolean,
  before_release: boolean,
  document_display_status: DocumentDisplayStatus | null,
  feature?: Feature
}

export type FactoriesResponse = Array<FactoryData>

export interface FactoriesByStatus {
  [key: string]: FactoryData[]
}

export type FactoryPostData = {
  name: string,
  type?: FactoryType,
  images?: string[],
  others?: string,
  lat: number,
  lng: number,
  nickname?: string,
  contact?: string
}

export type ReportRecord = {
  id: string,
  created_at: string,
  others?: string
}
