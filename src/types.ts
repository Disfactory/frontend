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

export type FactoryDisplayStatusType = 'default' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export const defaultFactoryDisplayStatuses = [
  'default', 0, 1, 2, 3, 4, 5, 6, 7
] as FactoryDisplayStatusType[]

type FactoryDisplayStatus = {
  type: FactoryDisplayStatusType,
  name: string,
  color: string
}
export const FactoryDisplayStatuses: FactoryDisplayStatus[] = [
  {
    type: 'default',
    name: '疑似工廠',
    color: '#D27E00'
  },
  {
    type: 0,
    name: '已檢舉',
    color: '#697F01'
  },
  {
    type: 1,
    name: '已排程稽查',
    color: '#C8D48D'
  },
  {
    type: 2,
    name: '陳述意見期',
    color: '#457287'
  },
  {
    type: 3,
    name: '已勒令停工',
    color: '#E59B9B'
  },
  {
    type: 4,
    name: '已發函斷電',
    color: '#CF5E5D'
  },
  {
    type: 5,
    name: '已排程拆除',
    color: '#A22A29'
  },
  {
    type: 6,
    name: '已拆除',
    color: '#364516'
  },
  {
    type: 7,
    name: '不再追蹤',
    color: '#A1A1A1'
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
  type: FactoryType,
  images: FactoryImage[],
  // TODO: can be one of https://docs.djangoproject.com/en/2.2/ref/settings/#datetime-input-formats
  // eslint-disable-next-line
  reported_at: null | string,
  data_complete: boolean,
  before_release: boolean,
  document_display_status?: string
}

export type FactoriesResponse = Array<FactoryData>

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
