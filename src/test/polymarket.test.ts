import { describe, it, expect, vi, beforeEach } from "vitest"
import { fetchAllMarkets, fetchMidpoints } from "../api/polymarket"
import type { Market } from "../api/polymarket"

const mkMkt = (id: string): Market => ({
  question: `Q${id}`, market_slug: `slug-${id}`, active: true,
  tokens: [{ token_id: `yes-${id}`, outcome:"Yes" }, { token_id: `no-${id}`, outcome:"No" }],
})

describe("fetchAllMarkets", () => {
  beforeEach(() => vi.restoreAllMocks())
  it("single page stops at LTE=", async () => {
    vi.spyOn(globalThis,"fetch").mockResolvedValueOnce({ ok:true, json:async()=>({ data:[mkMkt("1")], next_cursor:"LTE=" }) } as Response)
    const r = await fetchAllMarkets()
    expect(r).toHaveLength(1)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it("paginates multiple pages", async () => {
    vi.spyOn(globalThis,"fetch")
      .mockResolvedValueOnce({ ok:true, json:async()=>({ data:[mkMkt("1")], next_cursor:"abc" }) } as Response)
      .mockResolvedValueOnce({ ok:true, json:async()=>({ data:[mkMkt("2")], next_cursor:"LTE=" }) } as Response)
    const r = await fetchAllMarkets()
    expect(r).toHaveLength(2)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
  it("stops on empty cursor", async () => {
    vi.spyOn(globalThis,"fetch").mockResolvedValueOnce({ ok:true, json:async()=>({ data:[mkMkt("3")], next_cursor:"" }) } as Response)
    expect(await fetchAllMarkets()).toHaveLength(1)
  })
})

describe("fetchMidpoints", () => {
  beforeEach(() => vi.restoreAllMocks())
  it("single call for < 500 tokens", async () => {
    vi.spyOn(globalThis,"fetch").mockResolvedValueOnce({ ok:true, json:async()=>({ "yes-1":0.5,"no-1":0.5 }) } as Response)
    const r = await fetchMidpoints([mkMkt("1")])
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(r["yes-1"]).toBe(0.5)
  })
  it("2 batches for 300 markets (600 tokens)", async () => {
    vi.spyOn(globalThis,"fetch").mockResolvedValue({ ok:true, json:async()=>({}) } as Response)
    await fetchMidpoints(Array.from({length:300}, (_,i) => mkMkt(`${i}`)))
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
