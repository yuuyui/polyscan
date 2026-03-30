import type { Market, GapResult } from "../types"

export function calcGaps(markets: Market[], prices: Record<string, number>): GapResult[] {
  return markets
    .map(market => {
      const yes = prices[market.tokens[0]?.token_id] ?? 0
      const no  = prices[market.tokens[1]?.token_id] ?? 0
      if (yes === 0 || no === 0) return null
      const sum = yes + no
      const gap = Math.abs(1.0 - sum)
      const direction: GapResult["direction"] = sum < 1 ? "UNDER" : sum > 1 ? "OVER" : "FAIR"
      return { question: market.question, slug: market.market_slug, yes, no, sum, gap, direction }
    })
    .filter((r): r is GapResult => r !== null)
}
