import { test, expect } from "@playwright/test"

test.describe("Theme toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("theme toggle button is visible", async ({ page }) => {
    // Theme button contains a sync icon and a theme label
    const themeBtn = page.locator("button:has(.material-symbols-outlined:text('sync'))").first()
    await expect(themeBtn).toBeVisible()
  })

  test("clicking theme toggle changes the theme label", async ({ page }) => {
    const themeBtn = page.locator("button:has(.material-symbols-outlined:text('sync'))").first()
    const labelBefore = await themeBtn.locator("span.font-mono").textContent()
    await themeBtn.click()
    const labelAfter = await themeBtn.locator("span.font-mono").textContent()
    expect(labelAfter).not.toBe(labelBefore)
  })

  test("theme class is applied to document root after toggle", async ({ page }) => {
    const themeBtn = page.locator("button:has(.material-symbols-outlined:text('sync'))").first()
    const classBefore = await page.evaluate(() => document.documentElement.className)
    await themeBtn.click()
    const classAfter = await page.evaluate(() => document.documentElement.className)
    expect(classAfter).not.toBe(classBefore)
  })
})
