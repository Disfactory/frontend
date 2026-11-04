import { test, expect } from '@playwright/test'

import { dismissIntro, hideDevTools, mockApi, openSharedFactory } from './helpers'

const png = {
  name: 'photo.png',
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
    'base64',
  ),
}

async function startCreateFlow(page: import('@playwright/test').Page) {
  await page.goto('/')
  await hideDevTools(page)
  await dismissIntro(page)
  await page.getByText('我想新增可疑工廠').click()
  const choose = page.getByRole('button', { name: '選擇此地點' }).filter({ visible: true })
  await expect(choose).toBeVisible()
  await choose.click()
  await expect(page.getByText('上傳工廠照片').first()).toBeVisible({ timeout: 10000 })
}

test('keeps the create form open and shows an error when the POST fails', async ({ page }) => {
  await mockApi(page)
  await page.route('**/server/api/factories', async (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 500, json: { error: 'boom' } })
    }
    return route.fallback()
  })

  await startCreateFlow(page)
  await page.locator('input[type=file]').setInputFiles(png)
  await expect(page.getByText('上傳成功')).toBeVisible()
  await page.getByRole('button', { name: '下一步' }).click()
  await expect(page.getByRole('heading', { name: '確認及補充工廠資訊' })).toBeVisible()

  await page.getByPlaceholder('例：小明化工廠').fill('測試工廠')
  await page.getByRole('button', { name: '確認送出' }).click()

  await expect(page.getByText('新增可疑工廠失敗，請稍後再試。')).toBeVisible()
  await expect(page.getByRole('heading', { name: '確認及補充工廠資訊' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '新增可疑工廠成功', level: 3 })).toHaveCount(0)
})

test('uploads every selected photo batch on update', async ({ page }) => {
  await openSharedFactory(page)
  await page.getByRole('button', { name: '補充照片' }).click()
  await expect(page.getByText('上傳工廠照片')).toBeVisible()

  let uploads = 0
  let imagePosts = 0
  page.on('request', (request) => {
    if (request.url().endsWith('/upload')) uploads += 1
    if (request.url().endsWith('/factories/f1/images')) imagePosts += 1
  })

  const fileInput = page.locator('input[type=file]')
  await fileInput.setInputFiles(png)
  await fileInput.setInputFiles({ ...png, name: 'photo-2.png' })

  await expect(page.locator('.uploaded-image, img[src^="blob:"]')).toHaveCount(2)
  await page.getByRole('button', { name: '確認新增照片' }).click()

  await expect(page.getByRole('heading', { name: '補充工廠照片成功', level: 3 })).toBeVisible()
  expect(uploads).toBe(2)
  expect(imagePosts).toBe(2)
})

test('sends factory_type when updating the factory type', async ({ page }) => {
  await openSharedFactory(page)
  await page.getByRole('button', { name: '更改工廠類型' }).click()

  let updateBody: Record<string, unknown> | undefined
  page.on('request', (request) => {
    if (request.method() === 'PUT' && request.url().endsWith('/factories/f1')) {
      updateBody = request.postDataJSON() as Record<string, unknown>
    }
  })

  const panel = page.getByTestId('update-factory-panel')
  await panel.locator('select').selectOption('6')
  await panel.getByRole('button', { name: '確認更改工廠類型' }).click()

  await expect(page.getByRole('heading', { name: '補充工廠資訊成功', level: 3 })).toBeVisible()
  expect(updateBody).toEqual({ factory_type: '6' })
})

test.describe('mobile coordinate search', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('hides coordinates until requested and has a single clearable form', async ({ page }) => {
    await mockApi(page)
    await page.goto('/')
    await hideDevTools(page)
    await dismissIntro(page)
    await page.getByText('我想新增可疑工廠').click()

    await expect(page.getByText('以下經緯度版本為WGS84')).toHaveCount(0)

    await page.getByRole('button', { name: '顯示經緯度' }).click()
    await expect(page.getByText('以下經緯度版本為WGS84')).toBeVisible()

    await page.getByRole('button', { name: '搜尋經緯度' }).filter({ visible: true }).click()

    const longitude = page.getByPlaceholder('例：121.5231872')
    const latitude = page.getByPlaceholder('例：25.0458344')
    await expect(longitude).toHaveCount(1)
    await expect(latitude).toHaveCount(1)

    await longitude.fill('121.5')
    await latitude.fill('25.0')
    await page.getByRole('button', { name: '清空' }).click()
    await expect(longitude).toHaveValue('')
    await expect(latitude).toHaveValue('')
  })
})
