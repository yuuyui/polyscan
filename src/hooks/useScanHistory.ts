import { useState, useCallback } from "react"
import type { GapResult, ScanRecord } from "../types"

import { STORAGE_KEYS } from "../constants"
const STORAGE_KEY = STORAGE_KEYS.history
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
  } catch (err) {
    console.warn("[polyscan] Failed to load scan history from storage:", err)
    return []
  }
}

function saveToStorage(records: ScanRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (err) {
    console.warn("[polyscan] Failed to save scan history:", err)
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
