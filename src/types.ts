export interface GapResult {
  question:  string
  slug:      string
  yes:       number
  no:        number
  sum:       number
  gap:       number
  direction: "OVER" | "UNDER" | "FAIR"
}

export interface ScanRecord {
  id: string
  timestamp: Date
  totalScanned: number
  results: GapResult[]
}

export type FilterDirection = "ALL" | "OVER" | "UNDER"

