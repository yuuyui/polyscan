import { test, expect } from "@playwright/test"

/** Load mock data via exposed window function (no UI button) */
async function loadMock(page: import("@playwright/test").Page) {
  await page.evaluate(() => (window as Record<string, unknown>).__loadMock?.())
}

test.describe("Mock scan", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("loads mock data via loadMock", async ({ page }) => {
    await loadMock(page)
    await expect(page.getByRole("button", { name: /^View / }).first()).toBeVisible({ timeout: 5000 })
  })

  test("shows SCANNING state while scan is in progress", async ({ page }) => {
    await page.route("**/gamma/**", () => new Promise(() => {}))
    await page.getByRole("button", { name: /SCAN NOW/i }).first().click()
    await expect(page.getByRole("button", { name: /SCANNING/i }).first()).toBeVisible()
  })

  test("SCAN NOW button is disabled while scanning", async ({ page }) => {
    await page.route("**/gamma/**", () => new Promise(() => {}))
    await page.getByRole("button", { name: /SCAN NOW/i }).first().click()
    const scanBtn = page.getByRole("button", { name: /SCANNING/i }).first()
    await expect(scanBtn).toBeDisabled()
  })

  test("stats bar updates after mock scan", async ({ page }) => {
    await loadMock(page)
    await expect(page.getByRole("button", { name: /^View / }).first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator("text=/LAST:/").first()).toBeVisible()
  })
})

test.describe("Filter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await loadMock(page)
    await expect(page.getByRole("button", { name: /^View / }).first()).toBeVisible({ timeout: 5000 })
  })

  test("OVER filter shows only OVER direction signals", async ({ page }) => {
    await page.getByRole("button", { name: "OVER" }).first().click()
    await expect(page.locator(".bg-under-bg")).toHaveCount(0)
  })

  test("UNDER filter shows only UNDER direction signals", async ({ page }) => {
    await page.getByRole("button", { name: "UNDER" }).first().click()
    await expect(page.locator(".bg-over-bg")).toHaveCount(0)
  })

  test("ALL filter restores all signals", async ({ page }) => {
    await page.getByRole("button", { name: "OVER" }).first().click()
    await page.getByRole("button", { name: "ALL" }).first().click()
    const anySignal = page.getByRole("button", { name: /^View / }).first()
    await expect(anySignal).toBeVisible()
  })
})
