import { useState, useCallback } from "react"
import type { GapResult, ScanRecord } from "../types"

const STORAGE_KEY = "polyscan_history"
const MAX_RECORDS = 50

function loadFromStorage(): ScanRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((r): r is Record<string, unknown> =>
        r != null && typeof r === "object" &&
        typeof (r as Record<string, unknown>).id === "string" &&
        typeof (r as Record<string, unknown>).timestamp === "string" &&
        Array.isArray((r as Record<string, unknown>).results)
      )
      .map(r => ({
        id: r.id as string,
        timestamp: new Date(r.timestamp as string),
        totalScanned: typeof r.totalScanned === "number" ? r.totalScanned : 0,
        results: (r.results as GapResult[]),
      }))
  } catch {
    return []
  }
}

function saveToStorage(records: ScanRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // storage full — fail silently
  }
}

export function useScanHistory() {
  const [history, setHistory] = useState<ScanRecord[]>(loadFromStorage)

  const addScan = useCallback((results: GapResult[], totalScanned: number) => {
    const record: ScanRecord = {
      id: `scan-${Date.now()}`,
      timestamp: new Date(),
      totalScanned,
      results,
    }
    setHistory(prev => {
      const next = [record, ...prev].slice(0, MAX_RECORDS)
      saveToStorage(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }, [])

  return { history, addScan, clearAll }
}
