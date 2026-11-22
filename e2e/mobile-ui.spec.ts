import { test, expect } from '@playwright/test'

import { dismissIntro, hideDevTools, mockApi, openSharedFactory } from './helpers'

test.describe('mobile UI', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('opens the white navigation drawer and follows a link', async ({ page }) => {
    await mockApi(page)
    await page.goto('/')
    await hideDevTools(page)
    await dismissIntro(page)

    await page.getByRole('button', { name: '開啟主選單' }).click()

    const drawer = page.locator('aside[aria-label="主選單"]')
    await expect(drawer).toHaveClass(/translate-x-0/)
    await expect
      .poll(async () => (await drawer.boundingBox())?.x)
      .toBe(134)
    const box = await drawer.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBe(256)

    await drawer.getByRole('button', { name: '安全須知' }).click()
    await expect(page.getByText('請參考以下建議')).toBeVisible()

    const carousel = page.getByTestId('safety-carousel')
    const carouselBox = await carousel.boundingBox()
    expect(carouselBox).not.toBeNull()
    await page.mouse.move(
      carouselBox!.x + carouselBox!.width - 50,
      carouselBox!.y + carouselBox!.height / 2,
    )
    await page.mouse.down()
    await page.mouse.move(carouselBox!.x + 50, carouselBox!.y + carouselBox!.height / 2, {
      steps: 5,
    })
    await page.mouse.up()
    await expect(page.getByRole('heading', { name: '場勘' })).toBeVisible()
  })

  test('opens display settings as a bottom sheet', async ({ page }) => {
    await mockApi(page)
    await page.goto('/')
    await hideDevTools(page)
    await dismissIntro(page)

    await page.getByText('顯示設定').first().click()

    const sheet = page.getByTestId('display-settings-sheet')
    await expect(sheet).toBeVisible()
    await expect(sheet.getByText('地圖顯示設定')).toBeVisible()
    await expect(sheet.getByText('農地範圍 •')).toBeVisible()

    await expect
      .poll(async () => {
        const box = await sheet.boundingBox()
        return box ? Math.round(box.y + box.height) : null
      })
      .toBe(844)

    await sheet.getByRole('button', { name: '切換地圖模式 •' }).click()
    await expect(page.getByRole('button', { name: '衛星地圖' })).toBeVisible()
    await page.getByRole('button', { name: '簡易地圖' }).click()
    await expect(page.getByRole('button', { name: '衛星地圖' })).toBeHidden()
  })

  test('uses a full-screen page for mobile factory edits', async ({ page }) => {
    await openSharedFactory(page)
    await page.getByTestId('expand-detail').click()
    await page.getByRole('button', { name: '更改工廠類型' }).click()

    const panel = page.getByTestId('update-factory-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('heading', { name: '更改工廠類型' })).toBeVisible()
    await expect(panel.locator('select')).toBeVisible()
    await expect(panel.getByRole('button', { name: '確認更改工廠類型' })).toBeVisible()

    const box = await panel.boundingBox()
    expect(box).not.toBeNull()
    expect(box).toMatchObject({ x: 0, y: 0, width: 390, height: 844 })
  })
})
