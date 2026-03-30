import { CLOB_HOST, BATCH_SIZE } from '../config'
import type { Market } from '../types'
export type { Market } from '../types'

/** Fetch all active markets via pagination */
export async function fetchAllMarkets(): Promise<Market[]> {
  let cursor = ""
  const all: Market[] = []

  do {
    const url = `${CLOB_HOST}/markets?active=true&next_cursor=${cursor}`
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
      body: JSON.stringify({ params: batch.map(id => ({ token_id: id })) }),
    })
    if (!res.ok) throw new Error(`fetchMidpoints failed: ${res.status}`)
    const data = await res.json()
    Object.assign(results, data)
  }

  return results
}

/** Split array into chunks of given size */
export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size))
  }
  return out
}
