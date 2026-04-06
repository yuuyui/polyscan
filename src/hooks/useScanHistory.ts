import { useState, useCallback } from "react"
import type { GapResult, ScanRecord } from "../types"

const STORAGE_KEY = "polyscan_history"
const MAX_RECORDS = 50

function loadFromStorage(): ScanRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<Omit<ScanRecord, "timestamp"> & { timestamp: string }>
    return parsed.map(r => ({ ...r, timestamp: new Date(r.timestamp) }))
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
