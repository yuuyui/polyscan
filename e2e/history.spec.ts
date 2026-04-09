import { test, expect } from "@playwright/test"

async function loadMock(page: import("@playwright/test").Page) {
  await page.evaluate(() => (window as Record<string, unknown>).__loadMock?.())
}

test.describe("History page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("shows empty state when no scans have been run", async ({ page }) => {
    await page.getByRole("button", { name: /HISTORY/i }).first().click()
    await expect(page.locator("text=/no scan|no history|empty/i").first()).toBeVisible()
  })

  test("shows scan record after a mock scan", async ({ page }) => {
    await loadMock(page)
    await expect(page.getByRole("button", { name: /^View / }).first()).toBeVisible({ timeout: 5000 })
    await page.getByRole("button", { name: /HISTORY/i }).first().click()
    await expect(page.locator("text=/signals|results/i").first()).toBeVisible()
  })

  test("clear all button is visible when history exists", async ({ page }) => {
    await loadMock(page)
    await expect(page.getByRole("button", { name: /^View / }).first()).toBeVisible({ timeout: 5000 })
    await page.getByRole("button", { name: /HISTORY/i }).first().click()
    const clearBtn = page.getByRole("button", { name: /clear/i }).first()
    await expect(clearBtn).toBeVisible()
  })
})
