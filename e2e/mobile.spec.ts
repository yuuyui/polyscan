import { test, expect } from "@playwright/test"

const mobile = { viewport: { width: 390, height: 844 } }

test.describe("Mobile burger menu", () => {
  test.use(mobile)

  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("burger button is visible on mobile", async ({ page }) => {
    const burger = page.getByRole("button", { name: "Toggle menu" })
    await expect(burger).toBeVisible()
  })

  test("menu is closed by default", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Mobile navigation" })
    await expect(nav).not.toBeVisible()
  })

  test("burger opens the slide-over menu", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle menu" }).click()
    const nav = page.getByRole("navigation", { name: "Mobile navigation" })
    await expect(nav).toBeVisible()
  })

  test("menu shows all nav items", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle menu" }).click()
    const nav = page.getByRole("navigation", { name: "Mobile navigation" })
    await expect(nav.getByRole("button", { name: /TERMINAL/i })).toBeVisible()
    await expect(nav.getByRole("button", { name: /HISTORY/i })).toBeVisible()
    await expect(nav.getByRole("button", { name: /SETTINGS/i })).toBeVisible()
  })

  test("selecting a nav item closes the menu", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle menu" }).click()
    const nav = page.getByRole("navigation", { name: "Mobile navigation" })
    await nav.getByRole("button", { name: /HISTORY/i }).click()
    await expect(nav).not.toBeVisible()
  })

  test("selecting HISTORY navigates to history page", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle menu" }).click()
    const nav = page.getByRole("navigation", { name: "Mobile navigation" })
    await nav.getByRole("button", { name: /HISTORY/i }).click()
    await expect(page.getByRole("button", { name: "Toggle menu" })).toBeVisible()
    // burger should still be visible (mobile layout persists)
    await page.getByRole("button", { name: "Toggle menu" }).click()
    const reopened = page.getByRole("navigation", { name: "Mobile navigation" })
    await expect(reopened.getByRole("button", { name: /HISTORY/i })).toHaveAttribute("aria-current", "page")
  })

  test("clicking backdrop closes the menu", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle menu" }).click()
    const nav = page.getByRole("navigation", { name: "Mobile navigation" })
    await expect(nav).toBeVisible()
    await page.getByTestId("mobile-menu-backdrop").click()
    await expect(nav).not.toBeVisible()
  })

  test("desktop sidebar is not visible on mobile viewport", async ({ page }) => {
    const sidebar = page.locator("aside").first()
    await expect(sidebar).not.toBeVisible()
  })
})
