import { test, expect } from "@playwright/test"

test.describe("Settings page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: /SETTINGS/i }).first().click()
  })

  test("shows all setting sections", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "APPEARANCE" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "SCAN DEFAULTS" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "AUTO-SCAN" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "DATA & HISTORY" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "ABOUT" })).toBeVisible()
  })

  test("theme buttons are visible and clickable", async ({ page }) => {
    const defaultBtn = page.getByRole("button", { name: "DEFAULT", exact: true })
    const binanceBtn = page.getByRole("button", { name: "BINANCE", exact: true })
    await expect(defaultBtn).toBeVisible()
    await expect(binanceBtn).toBeVisible()

    await binanceBtn.click()
    // Binance button should now have the active border
    await expect(binanceBtn).toHaveClass(/border-primary/)
  })

  test("default view toggle works", async ({ page }) => {
    const cardsBtn = page.getByRole("button", { name: "CARDS" })
    const tableBtn = page.getByRole("button", { name: "TABLE" })
    await expect(cardsBtn).toBeVisible()
    await expect(tableBtn).toBeVisible()

    await tableBtn.click()
    await expect(tableBtn).toHaveClass(/bg-filter-active/)
  })

  test("direction filter defaults and toggles", async ({ page }) => {
    const allBtn = page.getByRole("button", { name: "ALL" }).nth(0)
    const overBtn = page.getByRole("button", { name: "OVER" }).nth(0)

    await expect(allBtn).toHaveClass(/bg-filter-active/)

    await overBtn.click()
    await expect(overBtn).toHaveClass(/bg-filter-active/)
    await expect(allBtn).not.toHaveClass(/bg-filter-active/)
  })

  test("market limit toggle works", async ({ page }) => {
    const btn100 = page.getByRole("button", { name: "100" }).first()
    const btn200 = page.getByRole("button", { name: "200" }).first()

    await expect(btn100).toHaveClass(/bg-filter-active/)

    await btn200.click()
    await expect(btn200).toHaveClass(/bg-filter-active/)
  })

  test("auto-scan toggle works", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /toggle auto-scan/i })
    await expect(toggle).toBeVisible()

    // Click to toggle
    const pressedBefore = await toggle.getAttribute("aria-pressed")
    await toggle.click()
    const pressedAfter = await toggle.getAttribute("aria-pressed")
    expect(pressedAfter).not.toBe(pressedBefore)
  })

  test("notify on signals toggle works", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /toggle signal notifications/i })
    await expect(toggle).toBeVisible()

    const pressedBefore = await toggle.getAttribute("aria-pressed")
    await toggle.click()
    const pressedAfter = await toggle.getAttribute("aria-pressed")
    expect(pressedAfter).not.toBe(pressedBefore)
  })

  test("min gap slider is interactive", async ({ page }) => {
    const slider = page.locator("input[type=range]").first()
    await expect(slider).toBeVisible()

    // Verify it has a value
    const value = await slider.inputValue()
    expect(Number(value)).toBeGreaterThan(0)
  })

  test("export format toggle works", async ({ page }) => {
    const jsonBtn = page.getByRole("button", { name: "JSON" })
    const csvBtn = page.getByRole("button", { name: "CSV" })

    await expect(jsonBtn).toBeVisible()
    await csvBtn.click()
    await expect(csvBtn).toHaveClass(/bg-filter-active/)
  })

  test("reset all settings button is visible", async ({ page }) => {
    const resetBtn = page.getByRole("button", { name: /reset all settings/i })
    await expect(resetBtn).toBeVisible()
  })

  test("version info is displayed", async ({ page }) => {
    await expect(page.getByText(/^v\d+\.\d+\.\d+/).first()).toBeVisible()
    await expect(page.locator("text=Gamma API").first()).toBeVisible()
  })
})

test.describe("Settings persistence", () => {
  test("settings persist after navigation", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: /SETTINGS/i }).first().click()

    // Change to TABLE view
    await page.getByRole("button", { name: "TABLE" }).click()

    // Navigate away and back
    await page.getByRole("button", { name: /TERMINAL/i }).first().click()
    await page.getByRole("button", { name: /SETTINGS/i }).first().click()

    // TABLE should still be active
    await expect(page.getByRole("button", { name: "TABLE" })).toHaveClass(/bg-filter-active/)
  })
})
