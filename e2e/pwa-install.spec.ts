import { expect, test } from '@playwright/test'

import { dismissIntro, hideDevTools, mockApi } from './helpers'

test('pwa install banner appears on beforeinstallprompt and persists dismissal', async ({
  page,
}) => {
  await mockApi(page)
  await page.goto('/')
  await hideDevTools(page)
  await dismissIntro(page)

  const banner = page.getByTestId('pwa-install-banner')
  await expect(banner).toBeHidden()

  await page.evaluate(() => window.dispatchEvent(new Event('beforeinstallprompt')))
  await expect(banner).toBeVisible()
  await expect(banner).toContainText('安裝')

  await page.getByTestId('pwa-install-cta').click()
  await expect(banner).toBeVisible()

  await page.getByTestId('pwa-install-dismiss').click()
  await expect(banner).toBeHidden()

  await page.reload()
  await hideDevTools(page)
  await expect(banner).toBeHidden()
})
