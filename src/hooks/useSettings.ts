import { useState, useCallback } from "react"
import type { FilterDirection } from "../types"
import { STORAGE_KEYS } from "../constants"

export interface Settings {
  defaultView: "CARDS" | "TABLE"
  minGap: number
  defaultDirection: FilterDirection
  marketLimit: 50 | 100 | 200
  feeRate: number
  autoScan: boolean
  scanInterval: "30s" | "1m" | "5m" | "10m"
  notifyOnSignals: boolean
  minSignalsToNotify: 1 | 3 | 5
  maxSavedScans: 25 | 50 | 100
  exportFormat: "JSON" | "CSV"
}

const STORAGE_KEY = STORAGE_KEYS.settings

export const SETTINGS_DEFAULTS: Settings = {
  defaultView: "CARDS",
  minGap: 0.03,
  defaultDirection: "ALL",
  marketLimit: 100,
  feeRate: 0.02,
  autoScan: false,
  scanInterval: "1m",
  notifyOnSignals: false,
  minSignalsToNotify: 1,
  maxSavedScans: 50,
  exportFormat: "JSON",
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SETTINGS_DEFAULTS
    return { ...SETTINGS_DEFAULTS, ...JSON.parse(raw) }
  } catch (err) {
    console.warn("[polyscan] Failed to load settings:", err)
    return SETTINGS_DEFAULTS
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load)

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (err) { console.warn("[polyscan] Failed to save settings:", err) }
      return next
    })
  }, [])

  const reset = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY) } catch (err) { console.warn("[polyscan] Failed to remove settings:", err) }
    setSettings(SETTINGS_DEFAULTS)
  }, [])

  return { settings, update, reset }
}
