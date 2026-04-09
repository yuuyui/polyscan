import { CLOB_HOST, GAMMA_HOST, BATCH_SIZE } from '../config'
import { SEED_RANGES } from '../constants'
import type { Market } from '../types'
export type { Market } from '../types'

/** Fetch all active markets via pagination */
export async function fetchAllMarkets(): Promise<Market[]> {
  let cursor = ""
  const all: Market[] = []

  do {
    const url = `${CLOB_HOST}/sampling-markets?next_cursor=${cursor}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`fetchAllMarkets failed: ${res.status}`)
    const data = await res.json()
    all.push(...(data.data ?? []))
    cursor = data.next_cursor ?? ""
  } while (cursor && cursor !== "LTE=")

  return all
}

/** Batch-fetch midpoint prices for all tokens */
export async function fetchMidpoints(
  markets: Market[]
): Promise<Record<string, number>> {
  const tokenIds = markets.flatMap(m => m.tokens.map(t => t.token_id))
  const batches  = chunk(tokenIds, BATCH_SIZE)
  const results: Record<string, number> = {}

  for (const batch of batches) {
    const res = await fetch(`${CLOB_HOST}/midpoints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch.map(id => ({ token_id: id }))),
    })
    if (!res.ok) throw new Error(`fetchMidpoints failed: ${res.status}`)
    const data: Record<string, string | number> = await res.json()
    for (const [k, v] of Object.entries(data)) {
      const num = Number(v)
      if (!Number.isNaN(num)) {
        results[k] = num
      }
    }
  }

  return results
}

/** Deterministic pseudo-random from string seed (0–1) */
function seededRand(seed: string, salt: string): number {
  let h = 0x811c9dc5
  const s = seed + salt
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return (h >>> 0) / 0xffffffff
}

/** Fetch real market names from Gamma API and attach simulated gaps */
export async function fetchGammaMarkets(limit = 100): Promise<import("../types").GapResult[]> {
  const res = await fetch(`${GAMMA_HOST}/markets?active=true&closed=false&limit=${limit}&order=volume&ascending=false`)
  if (!res.ok) throw new Error(`fetchGammaMarkets failed: ${res.status}`)
  const data: GammaMarket[] = await res.json()

  return data
    .filter(m => m.slug && m.question && !m.negRisk)
    .map(m => {
      const r1 = seededRand(m.slug, "yes")
      const r2 = seededRand(m.slug, "gap")
      const r3 = seededRand(m.slug, "dir")

      const yes     = SEED_RANGES.yesMin + r1 * SEED_RANGES.yesSpan
      const gap     = SEED_RANGES.gapMin + r2 * SEED_RANGES.gapSpan
      const direction = r3 < SEED_RANGES.directionThreshold ? "UNDER" : "OVER" as const
      const sum     = direction === "UNDER" ? 1 - gap : 1 + gap
      const no      = Math.max(SEED_RANGES.noMin, Math.min(SEED_RANGES.noMax, sum - yes))

      return {
        question:  m.question,
        slug:      m.slug,
        yes:       parseFloat(yes.toFixed(3)),
        no:        parseFloat(no.toFixed(3)),
        sum:       parseFloat(sum.toFixed(3)),
        gap:       parseFloat(gap.toFixed(4)),
        direction,
      }
    })
}

interface GammaMarket {
  slug:      string
  question:  string
  negRisk:   boolean
}

/** Split array into chunks of given size */
export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size))
  }
  return out
}
