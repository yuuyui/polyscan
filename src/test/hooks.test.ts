import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useScan } from "../hooks/useScan"
import { useSettings, SETTINGS_DEFAULTS } from "../hooks/useSettings"
import { useScanHistory } from "../hooks/useScanHistory"
import { useTheme } from "../hooks/useTheme"
import { STORAGE_KEYS } from "../constants"
import type { GapResult } from "../types"

// ─── useScan ─────────────────────────────────────────────────────────────────

vi.mock("../api/polymarket", () => ({
  fetchGammaMarkets: vi.fn(),
}))

import { fetchGammaMarkets } from "../api/polymarket"
const mockFetch = fetchGammaMarkets as ReturnType<typeof vi.fn>

const makeResult = (gap: number): GapResult => ({
  question: `Q gap=${gap}`,
  slug: `slug-${gap}`,
  yes: 0.6,
  no: 0.4,
  sum: 1.0 + gap,
  gap,
  direction: "OVER",
})

describe("useScan", () => {
  beforeEach(() => { mockFetch.mockReset() })

  it("starts with empty results and isScanning=false", () => {
    const { result } = renderHook(() => useScan(0.03))
    expect(result.current.results).toEqual([])
    expect(result.current.isScanning).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.lastScanAt).toBeNull()
    expect(result.current.totalScanned).toBe(0)
  })

  it("loadMock filters results by minGap", () => {
    const { result } = renderHook(() => useScan(0.05))
    act(() => { result.current.loadMock() })
    result.current.results.forEach(r => {
      expect(r.gap).toBeGreaterThanOrEqual(0.05)
    })
  })

  it("loadMock sets lastScanAt and totalScanned", () => {
    const { result } = renderHook(() => useScan(0.03))
    act(() => { result.current.loadMock() })
    expect(result.current.lastScanAt).toBeInstanceOf(Date)
    expect(result.current.totalScanned).toBeGreaterThan(0)
  })

  it("scan filters API results by minGap", async () => {
    const markets = [makeResult(0.02), makeResult(0.05), makeResult(0.08)]
    mockFetch.mockResolvedValue(markets)
    const { result } = renderHook(() => useScan(0.05))
    await act(async () => { await result.current.scan() })
    expect(result.current.results).toHaveLength(2)
    expect(result.current.results.every(r => r.gap >= 0.05)).toBe(true)
  })

  it("scan sets totalScanned to all markets before filtering", async () => {
    const markets = [makeResult(0.02), makeResult(0.05), makeResult(0.08)]
    mockFetch.mockResolvedValue(markets)
    const { result } = renderHook(() => useScan(0.05))
    await act(async () => { await result.current.scan() })
    expect(result.current.totalScanned).toBe(3)
  })

  it("scan sets error on failure", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"))
    const { result } = renderHook(() => useScan(0.03))
    await act(async () => { await result.current.scan() })
    expect(result.current.error).toBe("Network error")
    expect(result.current.isScanning).toBe(false)
  })

  it("scan calls onComplete callback with results and total", async () => {
    const markets = [makeResult(0.05)]
    mockFetch.mockResolvedValue(markets)
    const onComplete = vi.fn()
    const { result } = renderHook(() => useScan(0.03, onComplete))
    await act(async () => { await result.current.scan() })
    expect(onComplete).toHaveBeenCalledWith(markets, 1)
  })
})

// ─── useSettings ─────────────────────────────────────────────────────────────

describe("useSettings", () => {
  beforeEach(() => { localStorage.clear() })

  it("returns defaults when localStorage is empty", () => {
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings).toEqual(SETTINGS_DEFAULTS)
  })

  it("update merges patch into settings", () => {
    const { result } = renderHook(() => useSettings())
    act(() => { result.current.update({ minGap: 0.05 }) })
    expect(result.current.settings.minGap).toBe(0.05)
    expect(result.current.settings.defaultView).toBe(SETTINGS_DEFAULTS.defaultView)
  })

  it("update persists to localStorage", () => {
    const { result } = renderHook(() => useSettings())
    act(() => { result.current.update({ minGap: 0.07 }) })
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings)!)
    expect(stored.minGap).toBe(0.07)
  })

  it("reset restores defaults and clears localStorage", () => {
    const { result } = renderHook(() => useSettings())
    act(() => { result.current.update({ minGap: 0.1, autoScan: true }) })
    act(() => { result.current.reset() })
    expect(result.current.settings).toEqual(SETTINGS_DEFAULTS)
    expect(localStorage.getItem(STORAGE_KEYS.settings)).toBeNull()
  })

  it("loads persisted settings from localStorage on init", () => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ minGap: 0.09 }))
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings.minGap).toBe(0.09)
  })
})

// ─── useScanHistory ───────────────────────────────────────────────────────────

describe("useScanHistory", () => {
  beforeEach(() => { localStorage.clear() })

  it("starts with empty history", () => {
    const { result } = renderHook(() => useScanHistory())
    expect(result.current.history).toEqual([])
  })

  it("addScan prepends a record", () => {
    const { result } = renderHook(() => useScanHistory())
    act(() => { result.current.addScan([makeResult(0.05)], 10) })
    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].totalScanned).toBe(10)
    expect(result.current.history[0].results).toHaveLength(1)
  })

  it("addScan generates unique id per scan", () => {
    vi.useFakeTimers()
    try {
      const { result } = renderHook(() => useScanHistory())
      act(() => { result.current.addScan([], 5) })
      vi.advanceTimersByTime(1)
      act(() => { result.current.addScan([], 5) })
      const ids = result.current.history.map(r => r.id)
      expect(new Set(ids).size).toBe(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it("respects maxSavedScans limit", () => {
    const { result } = renderHook(() => useScanHistory(3))
    act(() => { result.current.addScan([], 1) })
    act(() => { result.current.addScan([], 2) })
    act(() => { result.current.addScan([], 3) })
    act(() => { result.current.addScan([], 4) })
    expect(result.current.history).toHaveLength(3)
  })

  it("clearAll empties history and localStorage", () => {
    const { result } = renderHook(() => useScanHistory())
    act(() => { result.current.addScan([makeResult(0.04)], 5) })
    act(() => { result.current.clearAll() })
    expect(result.current.history).toEqual([])
    expect(localStorage.getItem(STORAGE_KEYS.history)).toBeNull()
  })

  it("persists and reloads history from localStorage", () => {
    const { result: r1 } = renderHook(() => useScanHistory())
    act(() => { r1.current.addScan([makeResult(0.05)], 7) })
    const { result: r2 } = renderHook(() => useScanHistory())
    expect(r2.current.history).toHaveLength(1)
    expect(r2.current.history[0].totalScanned).toBe(7)
  })
})

// ─── useTheme ─────────────────────────────────────────────────────────────────

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ""
  })
  afterEach(() => {
    document.documentElement.className = ""
  })

  it("defaults to 'default' theme", () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe("default")
  })

  it("toggleTheme cycles to next theme", () => {
    const { result } = renderHook(() => useTheme())
    act(() => { result.current.toggleTheme() })
    expect(result.current.theme).toBe("binance")
  })

  it("toggleTheme wraps back to 'default' after last theme", () => {
    const { result } = renderHook(() => useTheme())
    act(() => { result.current.toggleTheme() }) // → binance
    act(() => { result.current.toggleTheme() }) // → default
    expect(result.current.theme).toBe("default")
  })

  it("persists theme to localStorage", () => {
    const { result } = renderHook(() => useTheme())
    act(() => { result.current.toggleTheme() })
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe("binance")
  })

  it("loads theme from localStorage on init", () => {
    localStorage.setItem(STORAGE_KEYS.theme, "binance")
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe("binance")
  })

  it("currentTheme matches active theme", () => {
    const { result } = renderHook(() => useTheme())
    act(() => { result.current.setTheme("binance") })
    expect(result.current.currentTheme.id).toBe("binance")
    expect(result.current.currentTheme.label).toBe("Binance")
  })

  it("returns all available themes", () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.themes.map(t => t.id)).toEqual(["default", "binance"])
  })
})
