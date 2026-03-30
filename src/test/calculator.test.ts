import { describe, it, expect } from "vitest"
import { calcGaps } from "../utils/calculator"
import type { Market } from "../api/polymarket"

const mk = (q: string, id1: string, id2: string): Market => ({
  question: q, market_slug: q.toLowerCase().replace(/ /g,"-"), active: true,
  tokens: [{ token_id: id1, outcome:"Yes" }, { token_id: id2, outcome:"No" }],
})

describe("calcGaps", () => {
  it("UNDER when sum < 1", () => {
    const r = calcGaps([mk("T","y1","n1")], { y1:0.45, n1:0.52 })
    expect(r[0].direction).toBe("UNDER")
    expect(r[0].sum).toBeCloseTo(0.97)
    expect(r[0].gap).toBeCloseTo(0.03)
  })
  it("OVER when sum > 1", () => {
    const r = calcGaps([mk("T","y2","n2")], { y2:0.58, n2:0.47 })
    expect(r[0].direction).toBe("OVER")
    expect(r[0].sum).toBeCloseTo(1.05)
    expect(r[0].gap).toBeCloseTo(0.05)
  })
  it("FAIR when sum == 1", () => {
    const r = calcGaps([mk("T","y3","n3")], { y3:0.50, n3:0.50 })
    expect(r[0].direction).toBe("FAIR")
    expect(r[0].gap).toBeCloseTo(0)
  })
  it("filters yes=0", () => {
    expect(calcGaps([mk("T","y4","n4")], { y4:0, n4:0.5 })).toHaveLength(0)
  })
  it("filters no=0", () => {
    expect(calcGaps([mk("T","y5","n5")], { y5:0.5, n5:0 })).toHaveLength(0)
  })
  it("filters missing prices", () => {
    expect(calcGaps([mk("T","y6","n6")], {})).toHaveLength(0)
  })
  it("multiple markets", () => {
    const r = calcGaps([mk("M1","a","b"), mk("M2","c","d")], { a:0.6, b:0.45, c:0.5, d:0.5 })
    expect(r).toHaveLength(2)
    expect(r[0].direction).toBe("OVER")
    expect(r[1].direction).toBe("FAIR")
  })
})
