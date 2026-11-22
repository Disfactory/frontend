import { expect, type Page } from '@playwright/test'

import type { FactoryData, FactoryTimeline, ReportRecord } from '@/types'

export const factory: FactoryData = {
  id: 'f1',
  display_number: 'A-001',
  lat: 24.09,
  lng: 120.48,
  name: '測試工廠',
  landcode: '123',
  townname: '測試鎮',
  sectname: '測試段',
  sectcode: '001',
  source: 'U',
  type: '9',
  images: [],
  reported_at: '2026-01-01T00:00:00Z',
  data_complete: true,
  before_release: false,
  document_display_status: null,
  follow_ups_for_user: [],
  wont_fix: false,
}

export const records: ReportRecord[] = Array.from({ length: 14 }, (_, index) => ({
  id: `record-${index}`,
  created_at: `2026-01-${String(index + 1).padStart(2, '0')}T00:00:00Z`,
  others: `第 ${index + 1} 筆工廠描述：這是一段用來讓詳細面板超出版面、驗證捲動行為的測試文字。`,
}))

export const timeline: FactoryTimeline = {
  factory_id: 'f1',
  display_number: 1,
  documents: [{ id: 1, created_at: '2026-01-05T02:00:00Z', display_status: '已檢舉' }],
  status_transitions: [
    {
      id: 1,
      from_status: '已檢舉',
      to_status: '已勒令停工',
      created_at: '2026-01-20T02:00:00Z',
      document_id: 1,
    },
  ],
  user_reports: records.map((record, index) => ({
    ...record,
    id: String(index + 1),
    action_type: 'UPDATE',
    action_body: {},
  })),
  follow_ups_for_user: [{ id: 1, note: '縣府已回覆會派員稽查。', created_at: '2026-01-15T02:00:00Z' }],
  image_batches: [
    {
      date: '2026-01-02',
      count: 2,
      images: [
        { id: 'i1', image_path: 'a', url: 'a', created_at: '2026-01-02T01:00:00Z' },
        { id: 'i2', image_path: 'b', url: 'b', created_at: '2026-01-02T02:00:00Z' },
      ],
    },
  ],
}

type MockOptions = { factory?: FactoryData; records?: ReportRecord[]; timeline?: FactoryTimeline }

export async function mockApi(page: Page, options: MockOptions = {}) {
  const currentFactory = options.factory ?? factory
  const currentRecords = options.records ?? records
  const currentTimeline = options.timeline ?? timeline
  await page.route('**/server/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname

    if (path.endsWith('/factories')) return route.fulfill({ json: [currentFactory] })
    if (path.endsWith('/factories/f1/report_records')) return route.fulfill({ json: currentRecords })
    if (path.endsWith('/factories/f1/timeline')) return route.fulfill({ json: currentTimeline })
    if (path.endsWith('/factories/f1/images')) {
      return route.fulfill({
        json: {
          id: 'image-1',
          image_path: 'https://example.com/photo.jpg',
          url: 'https://example.com/photo.jpg',
        },
      })
    }
    if (path.endsWith('/factories/f1')) return route.fulfill({ json: currentFactory })
    if (path.endsWith('/images')) return route.fulfill({ json: { token: 'token-1' } })
    if (path.endsWith('/upload')) {
      return route.fulfill({
        json: {
          success: true,
          data: { link: 'https://example.com/photo.jpg', deletehash: 'delete-1' },
        },
      })
    }

    return route.fulfill({ status: 404, json: {} })
  })

  await page.route('**/googletagmanager.com/**', (route) => route.abort())
  await page.route('**/google-analytics.com/**', (route) => route.abort())
  await page.route('**/stats.g.doubleclick.net/**', (route) => route.abort())
}

export async function hideDevTools(page: Page) {
  await page.addStyleTag({
    content:
      '#__vue-devtools-container__ { display: none !important; pointer-events: none !important; }',
  })
}

export async function dismissIntro(page: Page) {
  await page.getByRole('button', { name: '我同意加入回報' }).click()
}

export async function openSharedFactory(page: Page, options: MockOptions = {}) {
  await mockApi(page, options)
  await page.goto('/#map=16/120.48/24.09&factoryId=f1')
  await hideDevTools(page)
  await dismissIntro(page)
  await expect(page.getByTestId('factory-status')).toBeVisible()
}
