import { test, expect } from "@playwright/test"

test.describe("App shell", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("shows POLYSCAN branding in sidebar", async ({ page }) => {
    await expect(page.locator("text=POLYSCAN").first()).toBeVisible()
  })

  test("TERMINAL tab is active by default", async ({ page }) => {
    const terminalNav = page.locator("[aria-current=page]").first()
    await expect(terminalNav).toContainText("TERMINAL")
  })

  test("SCAN NOW button is visible and enabled", async ({ page }) => {
    const scanBtn = page.getByRole("button", { name: /SCAN NOW/i }).first()
    await expect(scanBtn).toBeVisible()
    await expect(scanBtn).toBeEnabled()
  })
})

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("navigates to HISTORY page", async ({ page }) => {
    await page.getByRole("button", { name: /HISTORY/i }).first().click()
    await expect(page.getByRole("button", { name: /HISTORY/i }).first()).toHaveAttribute("aria-current", "page")
  })

  test("navigates to SETTINGS page", async ({ page }) => {
    await page.getByRole("button", { name: /SETTINGS/i }).first().click()
    await expect(page.getByRole("button", { name: /SETTINGS/i }).first()).toHaveAttribute("aria-current", "page")
  })

  test("navigates back to TERMINAL page", async ({ page }) => {
    await page.getByRole("button", { name: /HISTORY/i }).first().click()
    await page.getByRole("button", { name: /TERMINAL/i }).first().click()
    await expect(page.getByRole("button", { name: /TERMINAL/i }).first()).toHaveAttribute("aria-current", "page")
  })
})
