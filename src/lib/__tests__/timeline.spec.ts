import { describe, expect, it } from 'vitest'

import {
  buildTimelineEvents,
  formatTimelineDate,
  getTimelineAlert,
  getFactoryStatus,
  getTransitionTitle,
} from '../timeline'
import type { FactoryTimeline } from '@/types'

const emptyTimeline: FactoryTimeline = {
  factory_id: 'f1',
  display_number: 1,
  documents: [],
  status_transitions: [],
  user_reports: [],
  follow_ups_for_user: [],
  image_batches: [],
}

describe('getFactoryStatus', () => {
  it.each([
    [null, 'actionable'],
    ['已檢舉', 'in_progress'],
    ['已排程稽查', 'in_progress'],
    ['陳述意見期', 'in_progress'],
    ['已勒令停工', 'actionable'],
    ['已發函斷電', 'actionable'],
    ['已排程拆除', 'actionable'],
    ['已拆除', 'demolished'],
    ['等待新事證', 'wont_fix'],
  ] as const)('maps %s to %s', (status, category) => {
    expect(getFactoryStatus({ wont_fix: false, document_display_status: status })).toBe(category)
  })

  it('treats wont_fix as 無法處理 whatever the document status', () => {
    expect(getFactoryStatus({ wont_fix: true, document_display_status: '已勒令停工' })).toBe(
      'wont_fix',
    )
  })
})

describe('getTimelineAlert', () => {
  it('asks for a new photo of a confirmed violation', () => {
    expect(
      getTimelineAlert({ wont_fix: false, document_display_status: '已勒令停工' })?.heading,
    ).toBe('能幫忙拍一下最新的照片嗎？')
  })

  it('does not claim a confirmed violation before any report is filed', () => {
    const alert = getTimelineAlert({ wont_fix: false, document_display_status: null })
    expect(alert?.heading).toBe('有誰能幫忙拍一下最新的照片嗎？')
    expect(alert?.body.join('')).not.toContain('主管機關已確認')
  })

  it('explains 無法處理', () => {
    expect(getTimelineAlert({ wont_fix: true, document_display_status: null })?.heading).toBe(
      '本工廠無法處理',
    )
  })

  it('shows nothing while a report is in progress or after demolition', () => {
    expect(getTimelineAlert({ wont_fix: false, document_display_status: '已檢舉' })).toBeNull()
    expect(getTimelineAlert({ wont_fix: false, document_display_status: '已拆除' })).toBeNull()
  })
})

describe('formatTimelineDate', () => {
  it('formats in Asia/Taipei', () => {
    // 16:30 UTC is already the next day in Taipei
    expect(formatTimelineDate('2023-06-04T16:30:00Z')).toBe('2023/06/05')
    expect(formatTimelineDate('2023-06-04T10:00:00+08:00')).toBe('2023/06/04')
  })
})

describe('getTransitionTitle', () => {
  it('labels penalties and falls back to a progress update', () => {
    expect(getTransitionTitle('已勒令停工')).toBe('處分：勒令停工')
    expect(getTransitionTitle('已斷電')).toBe('處分：停水停電')
    expect(getTransitionTitle('已排程稽查')).toBe('進度更新：已排程稽查')
  })
})

describe('buildTimelineEvents', () => {
  it('returns no events for an empty timeline', () => {
    expect(buildTimelineEvents(emptyTimeline)).toEqual([])
  })

  it('merges every source oldest first', () => {
    const events = buildTimelineEvents({
      ...emptyTimeline,
      documents: [{ id: 1, created_at: '2023-06-06T02:00:00Z', display_status: '已檢舉' }],
      status_transitions: [
        {
          id: 2,
          from_status: '已檢舉',
          to_status: '已勒令停工',
          created_at: '2023-06-08T02:00:00Z',
          document_id: 1,
        },
      ],
      follow_ups_for_user: [{ id: 3, note: '政府公文回覆', created_at: '2023-06-10T02:00:00Z' }],
      user_reports: [
        {
          id: '4',
          action_type: 'UPDATE',
          action_body: { factory_type: '2-1', name: '某某工廠' },
          created_at: '2023-06-07T02:00:00Z',
          others: '還是有在運作的聲音',
        },
        // POST_IMAGE is covered by image_batches
        { id: '5', action_type: 'POST_IMAGE', action_body: {}, created_at: '2023-06-04T02:00:00Z' },
        // an UPDATE with nothing to show is skipped
        {
          id: '6',
          action_type: 'UPDATE',
          action_body: {},
          created_at: '2023-06-09T02:00:00Z',
          others: '',
        },
      ],
      image_batches: [
        {
          date: '2023-06-04',
          count: 2,
          images: [
            { id: 'a', image_path: 'a', url: 'a', created_at: '2023-06-04T02:00:00Z' },
            { id: 'b', image_path: 'b', url: 'b', created_at: '2023-06-04T03:00:00Z' },
          ],
        },
      ],
    })

    expect(events.map((e) => [e.date, e.title, e.source])).toEqual([
      ['2023/06/04', '新照片事證', '匿名民眾'],
      ['2023/06/06', '發公文檢舉', '地球公民基金會'],
      ['2023/06/07', '新狀況回報', '匿名民眾'],
      ['2023/06/08', '處分：勒令停工', '地球公民基金會'],
      ['2023/06/10', '新狀況回報', '地球公民基金會'],
    ])
    expect(events[0]!.note).toEqual({ label: '備註：2 張照片。', lines: [] })
    expect(events[2]!.note).toEqual({
      label: '備註',
      lines: [
        '還是有在運作的聲音',
        '工廠外部文字：某某工廠',
        '工廠類型：金屬: 沖床、銑床、車床、鏜孔',
      ],
    })
    expect(events[4]!.note).toEqual({ label: '備註', lines: ['政府公文回覆'] })
  })
})
