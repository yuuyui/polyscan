import { describe, it, expect } from "vitest"
import { formatTimeUTC, formatDateISO, formatDateTimeUTC, formatTime24h, truncateText } from "../utils/format"
import { directionBadgeClass } from "../utils/direction-badge"

describe("formatTimeUTC", () => {
  it("formats date to HH:MM:SS UTC", () => {
    expect(formatTimeUTC(new Date("2026-03-15T14:30:45Z"))).toBe("14:30:45 UTC")
  })
})

describe("formatDateISO", () => {
  it("formats date to YYYY-MM-DD", () => {
    expect(formatDateISO(new Date("2026-03-15T14:30:45Z"))).toBe("2026-03-15")
  })
})

describe("formatDateTimeUTC", () => {
  it("formats date to full datetime", () => {
    expect(formatDateTimeUTC(new Date("2026-03-15T14:30:45Z"))).toBe("2026-03-15 14:30:45 UTC")
  })
})

describe("formatTime24h", () => {
  it("formats to 24h time in UTC", () => {
    expect(formatTime24h(new Date("2026-03-15T09:05:03Z"))).toBe("09:05:03 UTC")
  })

  it("handles midnight", () => {
    expect(formatTime24h(new Date("2026-01-01T00:00:00Z"))).toBe("00:00:00 UTC")
  })
})

describe("truncateText", () => {
  it("truncates long text with ellipsis", () => {
    expect(truncateText("Hello World of Testing", 10)).toBe("Hello Worl\u2026")
  })

  it("returns short text unchanged", () => {
    expect(truncateText("Short", 10)).toBe("Short")
  })

  it("returns exact length text unchanged", () => {
    expect(truncateText("1234567890", 10)).toBe("1234567890")
  })
})

describe("directionBadgeClass", () => {
  it("returns UNDER classes", () => {
    expect(directionBadgeClass("UNDER")).toBe("bg-under-bg text-under-text")
  })

  it("returns OVER classes", () => {
    expect(directionBadgeClass("OVER")).toBe("bg-over-bg text-over-text")
  })

  it("returns FAIR classes", () => {
    expect(directionBadgeClass("FAIR")).toBe("bg-surface-high text-text-muted")
  })
})
