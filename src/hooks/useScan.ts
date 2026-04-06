import { useState, useCallback } from "react"
import { fetchAllMarkets, fetchMidpoints } from "../api/polymarket"
import { calcGaps } from "../utils/calculator"
import type { GapResult } from "../types"

export function useScan(minGap: number, onComplete?: (results: GapResult[], totalScanned: number) => void) {
  const [results, setResults] = useState<GapResult[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [lastScanAt, setLastScanAt] = useState<Date | null>(null)
  const [totalScanned, setTotalScanned] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const scan = useCallback(async () => {
    setIsScanning(true)
    setError(null)
    try {
      const markets = await fetchAllMarkets()
      setTotalScanned(markets.length)
      const prices = await fetchMidpoints(markets)
      const gaps = calcGaps(markets, prices)
      const filtered = gaps.filter(g => g.gap >= minGap)
      setResults(filtered)
      setLastScanAt(new Date())
      onComplete?.(gaps, markets.length)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed")
    } finally {
      setIsScanning(false)
    }
  }, [minGap, onComplete])

  return { results, isScanning, lastScanAt, totalScanned, error, scan }
}
