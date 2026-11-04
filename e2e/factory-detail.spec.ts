import { test, expect, type Page } from '@playwright/test'

const factory = {
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

const records = Array.from({ length: 14 }, (_, index) => ({
  id: `record-${index}`,
  created_at: `2026-01-${String(index + 1).padStart(2, '0')}T00:00:00Z`,
  others: `第 ${index + 1} 筆工廠描述：這是一段用來讓詳細面板超出版面、驗證捲動行為的測試文字。`,
}))

async function mockApi(page: Page) {
  await page.route('**/server/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname

    if (path.endsWith('/factories')) return route.fulfill({ json: [factory] })
    if (path.endsWith('/factories/f1/report_records')) return route.fulfill({ json: records })
    if (path.endsWith('/factories/f1')) return route.fulfill({ json: factory })
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

async function hideDevTools(page: Page) {
  await page.addStyleTag({
    content:
      '#__vue-devtools-container__ { display: none !important; pointer-events: none !important; }',
  })
}

async function dismissIntro(page: Page) {
  await page.getByRole('button', { name: '我同意加入回報' }).click()
}

async function openSharedFactory(page: Page) {
  await mockApi(page)
  await page.goto('/#map=16/120.48/24.09&factoryId=f1')
  await hideDevTools(page)
  await dismissIntro(page)
  await expect(page.getByText('工廠狀態').first()).toBeVisible()
}

test.describe('factory detail on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('keeps the expand action on screen and scrolls after expanding', async ({ page }) => {
    await openSharedFactory(page)

    const expand = page.getByTestId('expand-detail')
    await expect(expand).toBeVisible()

    const box = await expand.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y + box!.height).toBeLessThanOrEqual(844)

    await expand.click()
    await expect(page.getByText('其他工廠資訊')).toBeVisible()

    const scroller = page.getByTestId('detail-scroller')
    await expect(scroller).toBeVisible()
    const metrics = await scroller.evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }))
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight)

    await scroller.evaluate((el) => {
      el.scrollTop = 200
    })
    expect(await scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
  })
})

test.describe('factory detail on desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('hides the detail panel when the supplement modal opens', async ({ page }) => {
    await openSharedFactory(page)
    await expect(page.getByText('其他工廠資訊')).toBeVisible()

    await page.getByRole('button', { name: '補充工廠描述' }).click()

    const panel = page.getByTestId('update-factory-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('heading', { name: '工廠描述' })).toBeVisible()
    await expect(panel.getByRole('button', { name: '新增工廠描述' })).toBeVisible()
    await expect(page.locator('aside')).toBeHidden()
  })
})

test('creates a factory with a mocked upload', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')
  await hideDevTools(page)
  await dismissIntro(page)

  await page.getByText('我想新增可疑工廠').click()

  const choose = page.getByRole('button', { name: '選擇此地點' }).filter({ visible: true })
  await expect(choose).toBeVisible()
  await choose.click()

  await expect(page.getByText('上傳工廠照片').first()).toBeVisible({ timeout: 10000 })

  await page.locator('input[type=file]').setInputFiles({
    name: 'photo.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
      'base64',
    ),
  })

  await expect(page.getByText('上傳成功')).toBeVisible()
  await page.getByRole('button', { name: '下一步' }).click()
  await expect(page.getByRole('heading', { name: '確認及補充工廠資訊' })).toBeVisible()

  await page.getByPlaceholder('例：小明化工廠').fill('測試工廠')
  await page.getByRole('button', { name: '確認送出' }).click()
  await expect(page.getByRole('heading', { name: '新增可疑工廠成功', level: 3 })).toBeVisible()
})
