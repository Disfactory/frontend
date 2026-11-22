import {
  FACTORY_TYPE,
  type FactoryData,
  type FactoryDisplayStatusType,
  type FactoryTimeline,
} from '@/types'

// Designer note: 尚可持續檢舉 = 待處理 / 停工 / 停水停電 / 排程拆除
// Mapped here in the frontend; the API returns raw statuses (Disfactory/Disfactory#697).
const CATEGORY_BY_DOCUMENT_STATUS: Record<string, FactoryDisplayStatusType> = {
  已檢舉: 'in_progress',
  已排程稽查: 'in_progress',
  陳述意見期: 'in_progress',
  處理中: 'in_progress',
  已勒令停工: 'actionable',
  已發函斷電: 'actionable',
  已斷電: 'actionable',
  已排程拆除: 'actionable',
  已拆除: 'demolished',
  等待新事證: 'wont_fix',
}

/** The category used for both the map pin and the detail panel title. */
export function getFactoryStatus(
  factory: Pick<FactoryData, 'wont_fix' | 'document_display_status'>,
): FactoryDisplayStatusType {
  if (factory.wont_fix) return 'wont_fix'
  const status = factory.document_display_status
  if (!status) return 'actionable' // not reported yet (待處理)
  return CATEGORY_BY_DOCUMENT_STATUS[status] ?? 'in_progress'
}

export type TimelineAlert = { heading: string; body: string[] }

export function getTimelineAlert(
  factory: Pick<FactoryData, 'wont_fix' | 'document_display_status'>,
): TimelineAlert | null {
  const category = getFactoryStatus(factory)
  if (category === 'wont_fix') {
    return {
      heading: '本工廠無法處理',
      body: [
        '此地點的使用型態目前並不符合《工廠管理輔導法》的管理範圍。',
        '不過，環境仍可能在未來發生變化。如果您之後看到新的使用跡象（建物擴建、設備增加、明顯營運等），歡迎上傳新的照片，我們會協助再次確認。',
      ],
    }
  }
  if (category !== 'actionable') return null
  if (factory.document_display_status) {
    return {
      heading: '能幫忙拍一下最新的照片嗎？',
      body: [
        '主管機關已確認此工廠屬違規使用。',
        '若您有經過現場，發現工廠尚未改善或拆除，請拍一張現場最新照片，我們就能再次檢舉。',
      ],
    }
  }
  // No document filed yet, so a violation hasn't been confirmed.
  return {
    heading: '有誰能幫忙拍一下最新的照片嗎？',
    body: ['此工廠目前尚未完全改善或拆除，若其實未改善，可使用照片進行再次的檢舉、處分。'],
  }
}

export const SOURCE_PUBLIC = '匿名民眾'
export const SOURCE_CET = '地球公民基金會'

export type TimelineEvent = {
  key: string
  /** ISO timestamp, used for ordering */
  at: string
  /** YYYY/MM/DD in Asia/Taipei */
  date: string
  title: string
  source: string
  /** `備註` box: `label` alone (e.g. `備註：1 張照片。`) or `備註` + body lines */
  note?: { label: string; lines: string[] }
}

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function formatTimelineDate(iso: string): string {
  const parts = dateFormatter.formatToParts(new Date(iso))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}/${get('month')}/${get('day')}`
}

const factoryTypeText = (value?: string) =>
  FACTORY_TYPE.find((type) => type.value === value)?.text ?? value

const PENALTY_TITLES: Record<string, string> = {
  已勒令停工: '處分：勒令停工',
  已發函斷電: '處分：發函斷電',
  已斷電: '處分：停水停電',
  已排程拆除: '處分：排程拆除',
  已拆除: '已拆除',
}

export function getTransitionTitle(toStatus: string): string {
  return PENALTY_TITLES[toStatus] ?? `進度更新：${toStatus}`
}

const noteWith = (lines: (string | undefined | null)[]) => {
  const filled = lines.map((line) => line?.trim()).filter((line): line is string => !!line)
  return filled.length > 0 ? { label: '備註', lines: filled } : undefined
}

/** Flatten the timeline API response into display events, oldest first. */
export function buildTimelineEvents(timeline: FactoryTimeline): TimelineEvent[] {
  const events: TimelineEvent[] = []

  for (const doc of timeline.documents) {
    events.push({
      key: `document-${doc.id}`,
      at: doc.created_at,
      date: formatTimelineDate(doc.created_at),
      title: '發公文檢舉',
      source: SOURCE_CET,
    })
  }

  for (const transition of timeline.status_transitions) {
    events.push({
      key: `transition-${transition.id}`,
      at: transition.created_at,
      date: formatTimelineDate(transition.created_at),
      title: getTransitionTitle(transition.to_status),
      source: SOURCE_CET,
    })
  }

  for (const followUp of timeline.follow_ups_for_user) {
    events.push({
      key: `follow-up-${followUp.id}`,
      at: followUp.created_at,
      date: formatTimelineDate(followUp.created_at),
      title: '新狀況回報',
      source: SOURCE_CET,
      note: noteWith([followUp.note]),
    })
  }

  for (const report of timeline.user_reports) {
    // Photo uploads are shown once per day through image_batches instead.
    if (report.action_type !== 'UPDATE') continue
    const body = report.action_body ?? {}
    const type = body.factory_type ?? body.type
    const note = noteWith([
      report.others,
      body.name ? `工廠外部文字：${body.name}` : null,
      type ? `工廠類型：${factoryTypeText(type)}` : null,
    ])
    if (!note) continue
    events.push({
      key: `report-${report.id}`,
      at: report.created_at,
      date: formatTimelineDate(report.created_at),
      title: '新狀況回報',
      source: SOURCE_PUBLIC,
      note,
    })
  }

  for (const batch of timeline.image_batches) {
    const first = batch.images[0]
    events.push({
      key: `images-${batch.date}`,
      at: first?.created_at ?? `${batch.date}T00:00:00+08:00`,
      date: batch.date.replace(/-/g, '/'),
      title: '新照片事證',
      source: SOURCE_PUBLIC,
      note: { label: `備註：${batch.count} 張照片。`, lines: [] },
    })
  }

  // Stable sort keeps the insertion order above for events at the same instant.
  return events.sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
}
