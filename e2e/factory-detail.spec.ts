import { test, expect } from '@playwright/test'

import { dismissIntro, factory, hideDevTools, mockApi, openSharedFactory } from './helpers'

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

test('matches the staging factory image carousel', async ({ page }) => {
  const images = [
    { id: 'image-1', image_path: '/images/menu-pic.png', url: '/images/menu-pic.png' },
    {
      id: 'image-2',
      image_path: '/images/safety_notice/1.png',
      url: '/images/safety_notice/1.png',
    },
    {
      id: 'image-3',
      image_path: '/images/safety_notice/2.png',
      url: '/images/safety_notice/2.png',
    },
  ]
  await openSharedFactory(page, { factory: { ...factory, images } })

  const update = page.getByTestId('update-image-button')
  const updateBox = await update.boundingBox()
  expect(updateBox).not.toBeNull()
  expect(updateBox!.width).toBe(100)
  expect(updateBox!.height).toBe(68)

  const image = page.getByTestId('carousel-image').first()
  const imageBox = await image.boundingBox()
  expect(imageBox).not.toBeNull()
  expect(imageBox!.width).toBe(120)
  expect(imageBox!.height).toBe(68)
  expect(await image.evaluate((el) => getComputedStyle(el).borderRadius)).toBe('0px')

  const carousel = page.getByTestId('image-carousel')
  await page.getByRole('button', { name: '下一張工廠照片' }).click()
  await expect.poll(() => carousel.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)

  await image.click()
  const overlay = page.locator('[data-slot="dialog-overlay"]')
  await expect(overlay).toBeVisible()
  expect(await overlay.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
    'rgba(30, 30, 30, 0.9)',
  )

  const lightbox = page.getByTestId('lightbox-content')
  const lightboxBox = await lightbox.boundingBox()
  expect(lightboxBox).not.toBeNull()
  const centerX = lightboxBox!.x + lightboxBox!.width / 2
  const centerY = lightboxBox!.y + lightboxBox!.height / 2
  await page.mouse.move(centerX + 80, centerY)
  await page.mouse.down()
  await page.mouse.move(centerX - 80, centerY, { steps: 5 })
  await page.mouse.up()
  await expect.poll(() => lightbox.locator('img').getAttribute('src')).toContain('safety_notice/1.png')
})

test.describe('factory detail on desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('keeps the detail panel and shows the supplement modal above it', async ({ page }) => {
    await openSharedFactory(page)
    await expect(page.getByText('其他工廠資訊')).toBeVisible()

    await page.getByRole('button', { name: '補充工廠描述' }).click()

    const panel = page.getByTestId('update-factory-panel')
    await expect(panel).toBeVisible()
    await expect(page.getByTestId('detail-panel')).toBeVisible()
    await expect(panel.getByRole('heading', { name: '工廠描述' })).toBeVisible()

    // If the detail panel were on top, this fill/click would be intercepted.
    await panel.getByPlaceholder('例：常常散發異味').fill('補充描述')
    await expect(panel.getByRole('button', { name: '新增工廠描述' })).toBeEnabled()
    await panel.getByRole('button', { name: '新增工廠描述' }).click()

    await expect(page.getByRole('heading', { name: '補充工廠資訊成功', level: 3 })).toBeVisible()
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
