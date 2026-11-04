import { test, expect } from '@playwright/test'

import { dismissIntro, hideDevTools, mockApi } from './helpers'

test.describe('overlays on desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('uses staging-sized modals, transparent backdrop, and closes the display popover on Escape', async ({
    page,
  }) => {
    await mockApi(page)
    await page.goto('/')
    await hideDevTools(page)
    await dismissIntro(page)

    const header = page.locator('header')
    const headerBox = await header.boundingBox()
    expect(headerBox).not.toBeNull()
    expect(headerBox!.height).toBe(64)
    expect(await header.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      'rgb(105, 127, 1)',
    )

    await header.getByRole('button', { name: '使用教學' }).click()
    const tutorial = page.getByRole('dialog')
    await expect(tutorial).toBeVisible()
    const tutorialBox = await tutorial.boundingBox()
    expect(tutorialBox).not.toBeNull()
    expect(tutorialBox!.width).toBeLessThanOrEqual(641)
    expect(tutorialBox!.width).toBeGreaterThan(300)

    const overlay = page.locator('[data-slot="dialog-overlay"]')
    expect(await overlay.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      'rgba(0, 0, 0, 0)',
    )

    await page.keyboard.press('Escape')
    await expect(tutorial).toBeHidden()

    await header.getByRole('button', { name: '安全須知' }).click()
    const safety = page.getByRole('dialog')
    await expect(safety).toBeVisible()
    const safetyBox = await safety.boundingBox()
    expect(safetyBox).not.toBeNull()
    expect(safetyBox!.width).toBeLessThanOrEqual(391)
    await page.keyboard.press('Escape')

    await header.getByRole('button', { name: '聯絡我們' }).click()
    const contact = page.getByRole('dialog')
    await expect(contact).toBeVisible()
    const contactBox = await contact.boundingBox()
    expect(contactBox).not.toBeNull()
    expect(contactBox!.width).toBeLessThanOrEqual(341)
    await page.keyboard.press('Escape')

    const pendingPill = page.getByRole('button', { name: '未處理' })
    const pillBox = await pendingPill.boundingBox()
    expect(pillBox).not.toBeNull()
    expect(pillBox!.width).toBeGreaterThan(105)
    expect(await pendingPill.locator('svg').evaluate((el) => getComputedStyle(el).width)).toBe('24px')

    await page.getByRole('button', { name: '顯示設定' }).click()
    await expect(page.getByText('農地範圍 •')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByText('農地範圍 •')).toBeHidden()
  })
})
