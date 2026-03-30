import { useState, useCallback } from "react"
import { fetchAllMarkets, fetchMidpoints } from "../api/polymarket"
import { calcGaps } from "../utils/calculator"
import type { GapResult } from "../types"

export function useScan(minGap: number) {
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
      setResults(gaps.filter(g => g.gap >= minGap))
      setLastScanAt(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed")
    } finally {
      setIsScanning(false)
    }
  }, [minGap])

  return { results, isScanning, lastScanAt, totalScanned, error, scan }
}
