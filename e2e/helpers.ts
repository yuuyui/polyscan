import type { Page } from "@playwright/test"

/** Load mock data via exposed window function (dev mode only) */
export async function loadMock(page: Page) {
  await page.evaluate(() => (window as Record<string, unknown>).__loadMock?.())
}
