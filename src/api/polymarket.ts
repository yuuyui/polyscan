import { GAMMA_HOST } from '../config'
import { SEED_RANGES } from '../constants'

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
